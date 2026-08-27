/**
 * Envoltorios sobre la Web Speech API del navegador: reconocimiento de
 * voz (STT) y síntesis de voz (TTS). Sin dependencias externas, sin
 * backend involucrado — el audio nunca sale del navegador.
 *
 * Soporte: Chrome/Edge lo tienen completo; Firefox no implementa
 * SpeechRecognition; Safari es parcial. Por eso `crearReconocimiento()`
 * devuelve `null` cuando no está disponible en vez de lanzar — el caller
 * decide qué mostrar en ese caso.
 */

/**
 * Crea una instancia de reconocimiento de voz configurada para inglés.
 * @returns {SpeechRecognition|null} `null` si el navegador no lo soporta.
 */
export function crearReconocimiento() {
  const SpeechRecognitionAPI =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!SpeechRecognitionAPI) return null;

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  return recognition;
}

/**
 * Hace que el navegador lea `texto` en voz alta y devuelve una Promise que
 * se resuelve cuando termina de hablar (o al toque, si la API no existe,
 * no hay texto, o falla) — pensado para poder hacer `await hablar(...)`
 * antes de seguir con el siguiente paso del flujo, en vez de adivinar
 * cuánto tarda con un `setTimeout` fijo (eso cortaba la frase a la mitad
 * cuando el texto era más largo de lo esperado: el `cancel()` de acá
 * abajo interrumpe cualquier lectura en curso apenas arranca la próxima).
 *
 * No fuerza ninguna voz específica: se deja que el navegador elija según
 * `lang`. Se probó preferir voces "de red" a mano (`localService===false`)
 * pero filtraba por los dos primeros caracteres del idioma, así que con
 * muchas variantes regionales instaladas (es-AR, es-MX, es-ES, etc.) podía
 * terminar eligiendo un acento distinto al pedido — se volvió atrás.
 */
export function hablar(texto, { lang = 'en-US' } = {}) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !texto) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = lang;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Presenta una frase de práctica en dos tramos hablados: una instrucción
 * corta en español y, después, la frase en inglés — cada una con el
 * idioma correcto en la síntesis de voz. Decirlo todo con una sola voz
 * (por ejemplo, `lang='en-US'` leyendo "Repite después de mí") suena mal:
 * una voz de inglés pronunciando español (o al revés) no es natural. Como
 * `hablar()` ya resuelve su Promise recién cuando termina de hablar de
 * verdad, encadenarlas con `await` alcanza para que suenen en cola, sin
 * solaparse ni cortarse.
 */
export async function presentarFrase(fraseIngles, instruccion = 'Repite después de mí:') {
  await hablar(instruccion, { lang: 'es-ES' });
  await hablar(fraseIngles, { lang: 'en-US' });
}
