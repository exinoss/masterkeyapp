"""
Views para la app Chatbot - AVI (Agente Virtual Inteligente).
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Avg, Sum
import random

from .models import AgenteVirtual, SesionPractica, Retroalimentacion, EstadoSesion
from .serializers import (
    AgenteVirtualSerializer, SesionPracticaSerializer,
    SesionPracticaCreateSerializer, SesionPracticaListSerializer,
    RetroalimentacionSerializer, RetroalimentacionCreateSerializer,
    InteraccionRequestSerializer, InteraccionResponseSerializer,
    EstadisticasSesionSerializer, ReporteEstudianteSerializer
)
from . import ai
from users.models import Estudiante, Docente, AsignacionDocenteEstudiante, TipoUsuario


class AgenteVirtualListView(generics.ListCreateAPIView):
    """
    Listar/Crear agentes virtuales.
    GET/POST /api/agentes/
    """
    queryset = AgenteVirtual.objects.filter(is_active=True)
    serializer_class = AgenteVirtualSerializer
    permission_classes = [permissions.IsAuthenticated]


class AgenteVirtualDetailView(generics.RetrieveUpdateAPIView):
    """
    Obtener/Actualizar un agente virtual.
    GET/PUT /api/agentes/<id>/
    """
    queryset = AgenteVirtual.objects.all()
    serializer_class = AgenteVirtualSerializer
    permission_classes = [permissions.IsAuthenticated]


# ==================== SESIONES DE PRÁCTICA ====================

class SesionPracticaListView(generics.ListCreateAPIView):
    """
    Listar/Crear sesiones de práctica del estudiante autenticado.
    GET/POST /api/sesiones/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        usuario = self.request.user
        if usuario.tipo_usuario == TipoUsuario.ESTUDIANTE:
            try:
                return SesionPractica.objects.filter(estudiante=usuario.perfil_estudiante)
            except Estudiante.DoesNotExist:
                return SesionPractica.objects.none()
        elif usuario.tipo_usuario == TipoUsuario.DOCENTE:
            # Solo las sesiones de sus estudiantes asignados — antes
            # devolvía TODAS las sesiones de TODOS los estudiantes.
            try:
                docente = usuario.perfil_docente
                return SesionPractica.objects.filter(
                    estudiante__docentes_asignados__docente=docente,
                    estudiante__docentes_asignados__activo=True
                )
            except Docente.DoesNotExist:
                return SesionPractica.objects.none()
        elif usuario.tipo_usuario == TipoUsuario.ADMINISTRADOR:
            return SesionPractica.objects.all()
        return SesionPractica.objects.none()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SesionPracticaCreateSerializer
        return SesionPracticaListSerializer
    
    def create(self, request, *args, **kwargs):
        usuario = request.user
        
        # Verificar que sea estudiante
        if usuario.tipo_usuario != TipoUsuario.ESTUDIANTE:
            return Response(
                {'error': 'Solo los estudiantes pueden crear sesiones'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            estudiante = usuario.perfil_estudiante
        except Estudiante.DoesNotExist:
            return Response(
                {'error': 'Perfil de estudiante no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Obtener agente virtual (usar el primero activo si no se especifica)
        agente_id = request.data.get('agente')
        if agente_id:
            agente = AgenteVirtual.objects.filter(id=agente_id, is_active=True).first()
        else:
            agente = AgenteVirtual.objects.filter(is_active=True).first()
        
        if not agente:
            # Crear agente por defecto si no existe
            agente = AgenteVirtual.objects.create(
                nombre='AVI Assistant',
                descripcion='Agente Virtual Inteligente para aprendizaje de inglés'
            )
        
        sesion = SesionPractica.objects.create(
            estudiante=estudiante,
            agente=agente,
            titulo=serializer.validated_data.get('titulo', f'Sesión {timezone.now().strftime("%d/%m/%Y %H:%M")}'),
            tema_practica=serializer.validated_data.get('tema_practica'),
            nivel_dificultad=serializer.validated_data.get('nivel_dificultad', estudiante.nivel_ingles),
            estado=EstadoSesion.EN_PROGRESO
        )
        
        return Response(
            SesionPracticaSerializer(sesion).data,
            status=status.HTTP_201_CREATED
        )


class SesionPracticaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Obtener/Actualizar/Eliminar una sesión de práctica.
    GET/PUT/DELETE /api/sesiones/<id>/
    """
    queryset = SesionPractica.objects.all()
    serializer_class = SesionPracticaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        usuario = self.request.user
        if usuario.tipo_usuario == TipoUsuario.ESTUDIANTE:
            try:
                return SesionPractica.objects.filter(estudiante=usuario.perfil_estudiante)
            except Estudiante.DoesNotExist:
                return SesionPractica.objects.none()
        return SesionPractica.objects.all()


class FinalizarSesionView(APIView):
    """
    Finalizar una sesión de práctica.
    POST /api/sesiones/<id>/finalizar/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            sesion = SesionPractica.objects.get(pk=pk)
            
            # Verificar permisos
            usuario = request.user
            if usuario.tipo_usuario == TipoUsuario.ESTUDIANTE:
                if sesion.estudiante.usuario != usuario:
                    return Response(
                        {'error': 'No tienes permiso para esta sesión'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Calcular métricas finales
            sesion.estado = EstadoSesion.COMPLETADA
            sesion.fecha_fin = timezone.now()
            
            # Calcular duración
            if sesion.fecha_inicio:
                duracion = sesion.fecha_fin - sesion.fecha_inicio
                sesion.duracion_minutos = int(duracion.total_seconds() / 60)
            
            # Calcular puntuación final
            sesion.calcular_puntuacion()
            
            # Actualizar métricas del estudiante
            estudiante = sesion.estudiante
            estudiante.sesiones_completadas += 1
            estudiante.horas_practica += sesion.duracion_minutos // 60
            
            # Recalcular puntuación promedio
            avg_puntuacion = SesionPractica.objects.filter(
                estudiante=estudiante,
                estado=EstadoSesion.COMPLETADA
            ).aggregate(Avg('puntuacion_sesion'))['puntuacion_sesion__avg']
            
            if avg_puntuacion:
                estudiante.puntuacion_promedio = avg_puntuacion
            
            estudiante.save()
            sesion.save()
            
            return Response({
                'mensaje': 'Sesión finalizada',
                'sesion': SesionPracticaSerializer(sesion).data,
                'estadisticas': {
                    'duracion_minutos': sesion.duracion_minutos,
                    'puntuacion_final': sesion.puntuacion_sesion,
                    'frases_correctas': sesion.frases_correctas,
                    'frases_incorrectas': sesion.frases_incorrectas
                }
            })
            
        except SesionPractica.DoesNotExist:
            return Response(
                {'error': 'Sesión no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )


class SiguienteFraseView(APIView):
    """
    Genera (con DeepSeek, o el respaldo local si no está disponible) la
    siguiente frase de práctica para una sesión, acorde a su tema y nivel.
    POST /api/sesiones/<id>/siguiente-frase/
    Reemplaza la elección aleatoria de un array fijo que hacía el frontend.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            sesion = SesionPractica.objects.get(pk=pk)
        except SesionPractica.DoesNotExist:
            return Response(
                {'error': 'Sesión no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        frase_anterior = request.data.get('frase_anterior')
        frase = ai.generar_frase_practica(
            sesion.tema_practica, sesion.nivel_dificultad, frase_anterior
        )
        return Response(frase)


# ==================== INTERACCIÓN CON EL AGENTE ====================

class InteraccionAgenteView(APIView):
    """
    Endpoint principal para interactuar con el agente virtual.
    El estudiante envía texto/audio y recibe retroalimentación.
    POST /api/interaccion/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        import time
        start_time = time.time()
        
        serializer = InteraccionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        sesion_id = serializer.validated_data['sesion_id']
        texto_estudiante = serializer.validated_data.get('texto_estudiante', '')
        texto_esperado = serializer.validated_data.get('texto_esperado', '')
        audio_base64 = serializer.validated_data.get('audio_base64', '')
        
        try:
            sesion = SesionPractica.objects.get(pk=sesion_id)
        except SesionPractica.DoesNotExist:
            return Response(
                {'error': 'Sesión no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar que la sesión esté activa
        if sesion.estado not in [EstadoSesion.INICIADA, EstadoSesion.EN_PROGRESO]:
            return Response(
                {'error': 'La sesión no está activa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # El ASR (voz -> texto) ya no pasa por acá: lo hace la Web Speech
        # API del navegador (frontend/src/utils/voz.js) y llega como texto
        # en `texto_estudiante`. Acá solo queda evaluar ese texto y generar
        # la respuesta del tutor — antes con una heurística de relleno,
        # ahora con DeepSeek (ver chatbot/ai.py), con esa misma heurística
        # como respaldo si la IA no está disponible.
        resultado_ia = ai.evaluar_interaccion(
            texto_estudiante, texto_esperado,
            sesion.tema_practica, sesion.nivel_dificultad
        )

        if resultado_ia:
            puntuacion_pronunciacion = resultado_ia['puntuacion_pronunciacion']
            puntuacion_fluidez = resultado_ia['puntuacion_fluidez']
            puntuacion_entonacion = resultado_ia['puntuacion_entonacion']
            puntuacion_ritmo = resultado_ia['puntuacion_ritmo']
            errores = resultado_ia['errores_gramaticales']
            sugerencias = resultado_ia['sugerencias']
            respuesta_agente = resultado_ia['respuesta_agente']
            emocion_avatar = resultado_ia['emocion_avatar']
        else:
            # Respaldo: la heurística original por comparación de palabras,
            # para que la app siga funcionando aunque DeepSeek esté caído,
            # sin key configurada, o dé un error inesperado.
            puntuacion_pronunciacion = self._analizar_pronunciacion(texto_estudiante, texto_esperado)
            puntuacion_fluidez = random.uniform(60, 100)
            puntuacion_entonacion = random.uniform(60, 100)
            puntuacion_ritmo = random.uniform(60, 100)
            errores, sugerencias = self._detectar_errores(texto_estudiante, texto_esperado)
            respuesta_agente = self._generar_respuesta(
                texto_estudiante, texto_esperado, puntuacion_pronunciacion
            )
            puntuacion_general_previa = (
                puntuacion_pronunciacion + puntuacion_fluidez +
                puntuacion_entonacion + puntuacion_ritmo
            ) / 4
            if puntuacion_general_previa >= 90:
                emocion_avatar = 'feliz'
            elif puntuacion_general_previa >= 70:
                emocion_avatar = 'neutral'
            elif puntuacion_general_previa >= 50:
                emocion_avatar = 'pensativo'
            else:
                emocion_avatar = 'animando'

        # Puntuación general: cálculo propio, determinista — no se le pide
        # a la IA que sume, para no depender de que lo haga bien.
        puntuacion_general = (
            puntuacion_pronunciacion + puntuacion_fluidez +
            puntuacion_entonacion + puntuacion_ritmo
        ) / 4
        necesita_repetir = puntuacion_general < 70
        
        # Calcular tiempo de respuesta
        tiempo_respuesta_ms = int((time.time() - start_time) * 1000)
        
        # Crear retroalimentación
        retroalimentacion = Retroalimentacion.objects.create(
            sesion=sesion,
            texto_original=texto_estudiante,
            texto_esperado=texto_esperado,
            texto_corregido=texto_esperado if errores else texto_estudiante,
            puntuacion_pronunciacion=puntuacion_pronunciacion,
            puntuacion_fluidez=puntuacion_fluidez,
            puntuacion_entonacion=puntuacion_entonacion,
            puntuacion_ritmo=puntuacion_ritmo,
            errores_gramaticales=errores,
            sugerencias=sugerencias,
            respuesta_agente=respuesta_agente,
            tiempo_respuesta_ms=tiempo_respuesta_ms
        )
        
        # Actualizar métricas de la sesión
        sesion.palabras_practicadas += len(texto_estudiante.split())
        if puntuacion_general >= 70:
            sesion.frases_correctas += 1
        else:
            sesion.frases_incorrectas += 1
        
        # Agregar al historial de conversación
        if sesion.historial_conversacion is None:
            sesion.historial_conversacion = []
        
        sesion.historial_conversacion.append({
            'tipo': 'estudiante',
            'texto': texto_estudiante,
            'timestamp': timezone.now().isoformat()
        })
        sesion.historial_conversacion.append({
            'tipo': 'agente',
            'texto': respuesta_agente,
            'timestamp': timezone.now().isoformat()
        })
        sesion.save()
        
        return Response({
            'success': True,
            'mensaje': 'Interacción procesada correctamente',
            'retroalimentacion': RetroalimentacionSerializer(retroalimentacion).data,
            'respuesta_texto': respuesta_agente,
            'respuesta_audio_url': None,  # TODO: Implementar TTS
            'puntuacion_general': puntuacion_general,
            'necesita_repetir': necesita_repetir,
            'emocion_avatar': emocion_avatar,
            'animacion_avatar': 'hablar' if respuesta_agente else 'escuchar'
        })
    
    def _analizar_pronunciacion(self, texto_estudiante: str, texto_esperado: str) -> float:
        """
        Comparación de similitud por palabras — RESPALDO cuando DeepSeek no
        está disponible (ver ai.evaluar_interaccion, que es el camino
        principal desde que existe). Se mantiene tal cual para que la app
        no se caiga del todo si falla la IA.
        """
        if not texto_estudiante or not texto_esperado:
            return 50.0
        
        # Comparación simple de similitud
        palabras_estudiante = texto_estudiante.lower().split()
        palabras_esperado = texto_esperado.lower().split()
        
        if not palabras_esperado:
            return 50.0
        
        coincidencias = sum(1 for p in palabras_estudiante if p in palabras_esperado)
        similitud = (coincidencias / len(palabras_esperado)) * 100
        
        # Agregar algo de variabilidad
        return min(100, max(0, similitud + random.uniform(-10, 10)))
    
    def _detectar_errores(self, texto_estudiante: str, texto_esperado: str) -> tuple:
        """
        Detecta errores por comparación posicional de palabras — RESPALDO,
        ver nota en _analizar_pronunciacion.
        """
        errores = []
        sugerencias = []
        
        if texto_estudiante and texto_esperado:
            palabras_estudiante = texto_estudiante.lower().split()
            palabras_esperado = texto_esperado.lower().split()
            
            for i, palabra_esp in enumerate(palabras_esperado):
                if i >= len(palabras_estudiante):
                    errores.append({
                        'tipo': 'omision',
                        'palabra': palabra_esp,
                        'posicion': i
                    })
                elif palabras_estudiante[i] != palabra_esp:
                    errores.append({
                        'tipo': 'sustitucion',
                        'palabra_incorrecta': palabras_estudiante[i],
                        'palabra_correcta': palabra_esp,
                        'posicion': i
                    })
                    sugerencias.append(f"Pronuncia '{palabra_esp}' en lugar de '{palabras_estudiante[i]}'")
        
        return errores, sugerencias
    
    def _generar_respuesta(self, texto_estudiante: str, texto_esperado: str, puntuacion: float) -> str:
        """
        Elige una respuesta fija según rango de puntuación — RESPALDO, ver
        nota en _analizar_pronunciacion.
        """
        if puntuacion >= 90:
            respuestas = [
                "¡Excelente pronunciación! Lo hiciste de maravilla.",
                "¡Muy bien! Tu pronunciación es casi perfecta.",
                "¡Fantástico! Estás progresando muchísimo."
            ]
        elif puntuacion >= 70:
            respuestas = [
                "¡Buen trabajo! Hay algunos detalles que podemos mejorar.",
                "Buen esfuerzo, practiquemos un poco más.",
                "¡Vas por buen camino! Practiquemos un poco más."
            ]
        elif puntuacion >= 50:
            respuestas = [
                "Intentémoslo de nuevo. Enfócate en pronunciar cada palabra con claridad.",
                "No te preocupes, ¡la práctica hace al maestro! Inténtalo de nuevo.",
                "Buen intento, te ayudo con la pronunciación."
            ]
        else:
            respuestas = [
                "No te rindas, vamos a practicarlo palabra por palabra.",
                "Está bien equivocarse, así se aprende. Inténtalo de nuevo.",
                "¡Vamos a intentarlo de nuevo! Escucha con atención y repite conmigo."
            ]
        
        return random.choice(respuestas)


# ==================== RETROALIMENTACIÓN ====================

class RetroalimentacionListView(generics.ListAPIView):
    """
    Listar retroalimentaciones de una sesión.
    GET /api/retroalimentaciones/?sesion_id=<id>

    Antes esta vista devolvía lo que fuera con solo pasarle un sesion_id,
    sin verificar que le perteneciera a quien pregunta — cualquier
    Estudiante podía leer la retroalimentación de cualquier otro. Se
    verifica dueño real antes de devolver nada.
    """
    serializer_class = RetroalimentacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        sesion_id = self.request.query_params.get('sesion_id')
        if not sesion_id:
            return Retroalimentacion.objects.none()

        usuario = self.request.user
        try:
            sesion = SesionPractica.objects.select_related('estudiante__usuario').get(pk=sesion_id)
        except SesionPractica.DoesNotExist:
            return Retroalimentacion.objects.none()

        if usuario.tipo_usuario == TipoUsuario.ESTUDIANTE:
            if sesion.estudiante.usuario_id != usuario.id:
                return Retroalimentacion.objects.none()
        elif usuario.tipo_usuario == TipoUsuario.DOCENTE:
            try:
                docente = usuario.perfil_docente
            except Docente.DoesNotExist:
                return Retroalimentacion.objects.none()
            asignado = AsignacionDocenteEstudiante.objects.filter(
                docente=docente, estudiante=sesion.estudiante, activo=True
            ).exists()
            if not asignado:
                return Retroalimentacion.objects.none()
        elif usuario.tipo_usuario != TipoUsuario.ADMINISTRADOR:
            return Retroalimentacion.objects.none()

        return Retroalimentacion.objects.filter(sesion_id=sesion_id)


# ==================== ESTADÍSTICAS Y REPORTES ====================

class EstadisticasEstudianteView(APIView):
    """
    Obtener estadísticas del estudiante autenticado.
    GET /api/estadisticas/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        usuario = request.user
        
        if usuario.tipo_usuario != TipoUsuario.ESTUDIANTE:
            return Response(
                {'error': 'Solo disponible para estudiantes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            estudiante = usuario.perfil_estudiante
        except Estudiante.DoesNotExist:
            return Response(
                {'error': 'Perfil de estudiante no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener estadísticas
        sesiones = SesionPractica.objects.filter(estudiante=estudiante)
        sesiones_completadas = sesiones.filter(estado=EstadoSesion.COMPLETADA)
        
        stats = sesiones_completadas.aggregate(
            total_minutos=Sum('duracion_minutos'),
            total_palabras=Sum('palabras_practicadas'),
            total_correctas=Sum('frases_correctas'),
            total_incorrectas=Sum('frases_incorrectas'),
            puntuacion_promedio=Avg('puntuacion_sesion')
        )
        
        return Response({
            'estudiante': {
                'nombre': estudiante.usuario.get_full_name(),
                'nivel_ingles': estudiante.nivel_ingles,
                'horas_practica': estudiante.horas_practica,
                'sesiones_completadas': estudiante.sesiones_completadas,
                'puntuacion_promedio': estudiante.puntuacion_promedio
            },
            'estadisticas': {
                'sesiones_totales': sesiones.count(),
                'sesiones_completadas': sesiones_completadas.count(),
                'tiempo_total_minutos': stats['total_minutos'] or 0,
                'palabras_practicadas': stats['total_palabras'] or 0,
                'frases_correctas': stats['total_correctas'] or 0,
                'frases_incorrectas': stats['total_incorrectas'] or 0,
                'puntuacion_promedio': round(stats['puntuacion_promedio'] or 0, 2)
            }
        })


class ReporteDocenteView(APIView):
    """
    Obtener reportes de estudiantes para docentes.
    GET /api/reportes/estudiantes/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        usuario = request.user
        
        if usuario.tipo_usuario not in [TipoUsuario.DOCENTE, TipoUsuario.ADMINISTRADOR]:
            return Response(
                {'error': 'Solo disponible para docentes y administradores'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener estudiantes según permisos.
        if usuario.tipo_usuario == TipoUsuario.DOCENTE:
            try:
                docente = usuario.perfil_docente
                estudiantes = Estudiante.objects.filter(
                    docentes_asignados__docente=docente,
                    docentes_asignados__activo=True
                )
            except Docente.DoesNotExist:
                estudiantes = Estudiante.objects.none()
        else:
            estudiantes = Estudiante.objects.all()
        
        reportes = []
        for estudiante in estudiantes:
            sesiones = SesionPractica.objects.filter(
                estudiante=estudiante,
                estado=EstadoSesion.COMPLETADA
            )
            
            stats = sesiones.aggregate(
                total_minutos=Sum('duracion_minutos'),
                puntuacion_promedio=Avg('puntuacion_sesion')
            )
            
            reportes.append({
                'estudiante_id': estudiante.id,
                'nombre_estudiante': estudiante.usuario.get_full_name(),
                'nivel_actual': estudiante.nivel_ingles,
                'sesiones_totales': sesiones.count(),
                'tiempo_practica_total': stats['total_minutos'] or 0,
                'puntuacion_promedio': round(stats['puntuacion_promedio'] or 0, 2),
                'progreso': {},
                'areas_mejora': [],
                'recomendaciones': []
            })
        
        return Response({
            'total_estudiantes': len(reportes),
            'reportes': reportes
        })
