"""
Integración con DeepSeek para el Agente Virtual (AVI/MasterKey).

DeepSeek es un modelo de texto: no transcribe audio ni genera voz (eso lo
hace la Web Speech API del navegador, del lado del frontend — ver
frontend/src/utils/voz.js). Lo que sí hace acá:

1. Generar la frase de práctica según tema/nivel (reemplaza el antiguo
   array fijo `frasesDemo` del frontend).
2. Evaluar la transcripción del estudiante contra la frase esperada y
   generar la respuesta del tutor.

Importante: como solo se recibe el TEXTO ya transcrito por el navegador
(nunca el audio — decisión explícita para no tener que resolver el
consentimiento de voz que la propia tesis cita), la "evaluación de
pronunciación" es una aproximación textual (qué tan bien coincide lo
transcrito con lo esperado, en palabras/orden/fluidez aparente), no un
análisis fonético/acústico real. El prompt se lo deja explícito al modelo
y hay que dejarlo igual de claro en cualquier reporte al usuario.

Ninguna función de este módulo lanza hacia arriba en el camino feliz de
"la IA no está disponible": si DeepSeek falla (sin key, red caída, JSON
inválido, timeout), se cae a un respaldo local para que la demo nunca se
rompa del todo.
"""
import json
import logging
import random

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

TIMEOUT_SEGUNDOS = 15

FRASES_FALLBACK = [
    {'texto': 'Hello, how are you today?', 'traduccion': 'Hola, ¿cómo estás hoy?'},
    {'texto': 'Nice to meet you!', 'traduccion': '¡Mucho gusto en conocerte!'},
    {'texto': 'Could you please repeat that?', 'traduccion': '¿Podrías repetir eso por favor?'},
    {'texto': 'I would like to order a coffee.', 'traduccion': 'Me gustaría pedir un café.'},
    {'texto': 'Thank you very much!', 'traduccion': '¡Muchas gracias!'},
]


def _llamar_deepseek(system_prompt, user_prompt):
    """
    POST al endpoint de chat de DeepSeek (API compatible con OpenAI).
    Devuelve el dict ya parseado desde el JSON que contestó el modelo.
    Lanza excepción ante cualquier falla — el caller decide el respaldo.
    """
    if not settings.DEEPSEEK_API_KEY:
        raise RuntimeError('DEEPSEEK_API_KEY no configurada')

    response = requests.post(
        settings.DEEPSEEK_API_URL,
        headers={
            'Authorization': f'Bearer {settings.DEEPSEEK_API_KEY}',
            'Content-Type': 'application/json',
        },
        json={
            'model': 'deepseek-chat',
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            'response_format': {'type': 'json_object'},
            'temperature': 0.7,
        },
        timeout=TIMEOUT_SEGUNDOS,
    )
    response.raise_for_status()
    contenido = response.json()['choices'][0]['message']['content']
    return json.loads(contenido)


def generar_frase_practica(tema_practica, nivel_dificultad, frase_anterior=None):
    """
    Devuelve {"texto": "...", "traduccion": "..."} — SIEMPRE, nunca lanza.
    Con DeepSeek disponible, la frase se genera acorde al tema/nivel de la
    sesión; si falla, se elige una del respaldo local.

    `frase_anterior`: la última frase que ya se le pidió repetir al
    estudiante en esta sesión (si hay). Sin esto, DeepSeek tiende a repetir
    la misma frase "canónica" para combinaciones de tema/nivel muy típicas
    (ej. "Hello, my name is..." para Saludos+A1 sale casi siempre igual) —
    se le pide explícitamente que no la repita.
    """
    try:
        user_prompt = (
            f'Tema: {tema_practica or "conversación general"}. '
            f'Nivel: {nivel_dificultad or "A1"}.'
        )
        if frase_anterior:
            user_prompt += f' No repitas esta frase, ya se practicó: "{frase_anterior}"'

        resultado = _llamar_deepseek(
            'Sos un generador de frases de práctica de inglés para una app '
            'de aprendizaje de idiomas. Dado un tema y un nivel del Marco '
            'Común Europeo de Referencia (A1 a C2), generá UNA sola frase '
            'corta en inglés apropiada para practicar pronunciación oral, '
            'junto con su traducción al español. Si te pasan una frase que '
            'ya se usó, generá una distinta (mismo tema y nivel, otro '
            'contenido). Respondé ÚNICAMENTE con JSON en este formato '
            'exacto: {"texto": "...", "traduccion": "..."}',
            user_prompt
        )
        if 'texto' in resultado and 'traduccion' in resultado:
            return resultado
        raise ValueError('Respuesta de DeepSeek sin las claves esperadas')
    except Exception:
        logger.exception('No se pudo generar frase con DeepSeek, usando respaldo local')
        return random.choice(FRASES_FALLBACK)


def evaluar_interaccion(texto_estudiante, texto_esperado, tema_practica, nivel_dificultad):
    """
    Devuelve un dict con puntuacion_pronunciacion/fluidez/entonacion/ritmo,
    errores_gramaticales, sugerencias, respuesta_agente y emocion_avatar,
    o None si DeepSeek no está disponible — el caller (InteraccionAgenteView)
    decide el respaldo heurístico en ese caso.
    """
    try:
        resultado = _llamar_deepseek(
            'Sos un tutor de pronunciación de inglés dentro de una app de '
            'práctica oral. Vas a recibir la frase que se le pidió repetir '
            'a un estudiante y la transcripción de lo que dijo, generada '
            'por reconocimiento de voz del navegador. No tenés el audio '
            'real: evaluá qué tan bien la transcripción coincide con la '
            'frase esperada en palabras, orden y fluidez aparente — es una '
            'aproximación textual de la pronunciación, no un análisis '
            'fonético real. Respondé ÚNICAMENTE con JSON con estas claves: '
            'puntuacion_pronunciacion, puntuacion_fluidez, '
            'puntuacion_entonacion, puntuacion_ritmo (números de 0 a 100), '
            'errores_gramaticales (lista de objetos con "palabra_incorrecta" '
            'y "palabra_correcta"), sugerencias (lista de strings cortos en '
            'español), respuesta_agente, emocion_avatar (exactamente uno de '
            'estos cuatro valores: "feliz", "neutral", "pensativo", '
            '"animando"). '
            'Sobre respuesta_agente: la app la lee en voz alta con síntesis '
            'de voz del navegador usando una sola voz en español — por eso '
            'TIENE QUE estar completamente en español, sin mezclar palabras '
            'ni frases en inglés (una voz de español pronunciando inglés '
            'suena mal). Si necesitás citar la frase correcta en inglés, no '
            'lo hagas acá: ya va aparte en el campo "sugerencias". Que sea '
            'UNA sola oración corta (máximo ~15 palabras), nada de párrafos '
            'largos. Además define el flujo siguiente, así que el tono '
            'importa: si el promedio de las cuatro puntuaciones da 70 o '
            'más, la app va a pasar a una frase nueva — escribí algo breve '
            'de felicitación/cierre (ej. "¡Muy bien! Vamos con la '
            'siguiente."). Si da menos de 70, la app le va a pedir que '
            'repita la MISMA frase — escribí algo que lo diga explícitamente '
            'y anime a intentar de nuevo (ej. "No pasa nada, '
            '¡intentémoslo de nuevo!").',
            f'Frase esperada: "{texto_esperado}"\n'
            f'Transcripción del estudiante: "{texto_estudiante}"\n'
            f'Tema: {tema_practica or "conversación general"}. '
            f'Nivel: {nivel_dificultad or "A1"}.'
        )

        # Defaults defensivos por si el modelo omite alguna clave.
        resultado.setdefault('puntuacion_pronunciacion', 50)
        resultado.setdefault('puntuacion_fluidez', 50)
        resultado.setdefault('puntuacion_entonacion', 50)
        resultado.setdefault('puntuacion_ritmo', 50)
        resultado.setdefault('errores_gramaticales', [])
        resultado.setdefault('sugerencias', [])
        resultado.setdefault('respuesta_agente', 'Buen intento. ¡Sigamos practicando!')
        if resultado.get('emocion_avatar') not in ('feliz', 'neutral', 'pensativo', 'animando'):
            resultado['emocion_avatar'] = 'neutral'
        return resultado
    except Exception:
        logger.exception('No se pudo evaluar la interacción con DeepSeek, usando heurística de respaldo')
        return None
