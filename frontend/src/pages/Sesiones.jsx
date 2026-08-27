/**
 * Sesiones — MasterKey
 * Lista de sesiones, selección de tema y sesión activa con el avatar.
 */
import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { sesionesService, interaccionService } from '../services/api';
import { crearReconocimiento, hablar, presentarFrase } from '../utils/voz';
import {
  MessageSquare,
  Plus,
  Play,
  Pause,
  Mic,
  MicOff,
  Send,
  Clock,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  Handshake,
  UtensilsCrossed,
  Briefcase,
  Plane,
  Phone,
  MessagesSquare
} from 'lucide-react';

// El runtime de Rive y el .riv solo se descargan al entrar a una sesión,
// no en cada carga del dashboard.
const Avatar = lazy(() => import('../components/Avatar'));

export default function Sesiones() {
  const { user } = useAuth();
  const [view, setView] = useState('list'); // 'list' | 'session'
  const [sesionActiva, setSesionActiva] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarEmotion, setAvatarEmotion] = useState('neutral');
  const [avatarMessage, setAvatarMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [score, setScore] = useState(0);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [cargandoFrase, setCargandoFrase] = useState(false);
  const [errorVoz, setErrorVoz] = useState('');
  const conversationEndRef = useRef(null);
  // Una sola instancia de SpeechRecognition reutilizada entre grabaciones
  // (creada al tocar el micrófono por primera vez, no en el render).
  const reconocimientoRef = useRef(null);

  // Historial real de sesiones (GET /api/sesiones/)
  const [sesiones, setSesiones] = useState([]);
  const [loadingSesiones, setLoadingSesiones] = useState(true);
  const [errorSesiones, setErrorSesiones] = useState('');

  // Sin setState síncrono antes del primer `await`: así una llamada directa
  // desde el useEffect de montaje no dispara set-state-in-effect. Quien
  // necesite mostrar "Cargando…" de nuevo (p. ej. al volver de una sesión)
  // resetea loading/error él mismo antes de llamar a esta función — ver
  // `finalizarSesion`, que no es un efecto sino un manejador de evento.
  const listarSesiones = useCallback(async () => {
    try {
      const data = await sesionesService.listar();
      setSesiones(data);
    } catch {
      setErrorSesiones('No se pudo cargar el historial de sesiones.');
    } finally {
      setLoadingSesiones(false);
    }
  }, []);

  useEffect(() => {
    listarSesiones();
  }, [listarSesiones]);

  // Temas disponibles para nueva sesión
  const temasDisponibles = [
    {
      id: 1,
      nombre: 'Saludos y Presentaciones',
      nivel: 'A1',
      descripcion: 'Aprende a saludar y presentarte en inglés',
      Icono: Handshake
    },
    {
      id: 2,
      nombre: 'En el Restaurante',
      nivel: 'A2',
      descripcion: 'Vocabulario para ordenar comida',
      Icono: UtensilsCrossed
    },
    {
      id: 3,
      nombre: 'Entrevista de Trabajo',
      nivel: 'B1',
      descripcion: 'Prepárate para entrevistas laborales',
      Icono: Briefcase
    },
    {
      id: 4,
      nombre: 'Viajes y Aeropuerto',
      nivel: 'B1',
      descripcion: 'Situaciones comunes al viajar',
      Icono: Plane
    },
    {
      id: 5,
      nombre: 'Conversación Telefónica',
      nivel: 'B2',
      descripcion: 'Habla por teléfono con confianza',
      Icono: Phone
    },
    {
      id: 6,
      nombre: 'Debate y Opiniones',
      nivel: 'C1',
      descripcion: 'Expresa y defiende tus ideas',
      Icono: MessagesSquare
    }
  ];

  // Timer de sesión
  useEffect(() => {
    let interval;
    if (sesionActiva && !isPaused) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sesionActiva, isPaused]);

  // Mantener la conversación desplazada al último mensaje
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatear fecha ISO del backend para el historial
  const formatearFecha = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // El backend (InteraccionAgenteView) usa un vocabulario de emociones más
  // simple que el avatar (Avatar.jsx / GESTO_EMOCION): no conoce
  // 'superFeliz' ni 'enojado', y usa 'pensativo'/'animando' donde el
  // avatar espera 'triste'. Se traduce acá en vez de tocar el contrato
  // del backend o inventarle estados que no calcula de verdad.
  const mapearEmocionAvatar = (emocionBackend, puntuacion) => {
    if (puntuacion >= 100) return 'superFeliz';
    if (emocionBackend === 'feliz') return 'feliz';
    if (emocionBackend === 'pensativo' || emocionBackend === 'animando') return 'triste';
    return 'neutral';
  };

  // Color del indicador de puntuación
  const estiloPuntuacion = (valor) => {
    if (valor >= 85) return 'bg-mk-success-bg text-mk-success';
    if (valor >= 70) return 'bg-mk-streak-bg text-mk-streak-ink';
    return 'bg-mk-error-bg text-mk-error';
  };

  // Iniciar nueva sesión (POST /api/sesiones/)
  const iniciarSesion = async (tema) => {
    setShowNewSessionModal(false);

    try {
      const sesion = await sesionesService.crear({
        titulo: tema.nombre,
        tema_practica: tema.nombre,
        nivel_dificultad: tema.nivel
      });

      setSesionActiva(sesion);
      setView('session');
      setSessionTime(0);
      setScore(0);
      setConversation([]);

      // Mensaje inicial del avatar — se lee en voz alta también (es texto
      // 100% en español, sin mezcla con inglés, así que alcanza con una
      // sola llamada a `hablar`, no hace falta partirlo como
      // `presentarFrase`). Se espera a que termine de hablar de verdad
      // antes de seguir, mismo motivo que en el resto del flujo.
      setTimeout(async () => {
        const saludo = `¡Hola${user?.nombre ? ', ' + user.nombre : ''}! Soy tu tutor de MasterKey. ¿Listo para practicar?`;
        setAvatarEmotion('feliz');
        setAvatarMessage(saludo);
        setIsSpeaking(true);

        if (!isMuted) {
          await hablar(saludo, { lang: 'es-ES' });
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        setIsSpeaking(false);
        setAvatarMessage('');
        mostrarSiguienteFrase(sesion.id);
      }, 1000);
    } catch (err) {
      console.error('No se pudo iniciar la sesión', err);
      setErrorSesiones('No se pudo iniciar la sesión. Intenta de nuevo.');
    }
  };

  // Pedir la siguiente frase de práctica (generada por DeepSeek en el
  // backend, o su respaldo si la IA no está disponible — ver
  // POST /api/sesiones/<id>/siguiente-frase/) y leerla en voz alta.
  //
  // Recibe el id de sesión por parámetro (con `sesionActiva?.id` como
  // default) en vez de leer `sesionActiva` únicamente por closure: se
  // llama desde dentro de un setTimeout anidado en `iniciarSesion`, cuyo
  // closure quedó fijado en el render donde `sesionActiva` todavía era
  // null (la actualización de estado llega recién en el próximo render) —
  // sin el parámetro explícito, esa llamada se cortaba en silencio.
  const mostrarSiguienteFrase = async (sesionId = sesionActiva?.id) => {
    if (!sesionId) return;

    setCargandoFrase(true);
    try {
      // Se manda la frase que estaba mostrándose (si había) para que
      // DeepSeek no la repita — sin esto tiende a devolver la misma
      // frase "canónica" para combinaciones típicas de tema/nivel.
      const frase = await sesionesService.siguienteFrase(sesionId, currentPhrase?.texto);
      setCurrentPhrase(frase);
      setAvatarEmotion('neutral');
      setAvatarMessage(`Repite: "${frase.texto}"`);
      setIsSpeaking(true);
      if (!isMuted) {
        await presentarFrase(frase.texto);
        setIsSpeaking(false);
      } else {
        setTimeout(() => setIsSpeaking(false), 1500);
      }
    } catch (err) {
      console.error('No se pudo generar la siguiente frase', err);
    } finally {
      setCargandoFrase(false);
    }
  };

  // Vuelve a mostrar y a leer la MISMA frase, sin pedir una nueva al
  // backend — se usa cuando la puntuación fue baja (`necesita_repetir`) y
  // hay que reintentar en vez de avanzar. Ver `enviarRespuesta`.
  const repetirFrase = async () => {
    if (!currentPhrase) return;
    setAvatarEmotion('neutral');
    setAvatarMessage(`Repite: "${currentPhrase.texto}"`);
    setIsSpeaking(true);
    if (!isMuted) {
      await presentarFrase(currentPhrase.texto, 'Inténtalo de nuevo:');
      setIsSpeaking(false);
    } else {
      setTimeout(() => setIsSpeaking(false), 1500);
    }
  };

  // Enviar respuesta del usuario al agente (POST /api/interaccion/).
  // Acepta el texto por parámetro (usado al transcribir por voz, para
  // enviarlo directo sin esperar a que se actualice el estado `userInput`
  // — mismo motivo que `mostrarSiguienteFrase(sesionId)`: un valor leído
  // por closure en vez de por parámetro puede llegar desactualizado).
  const enviarRespuesta = async (textoOverride) => {
    const textoEnviado = (textoOverride ?? userInput).trim();
    if (!textoEnviado || !sesionActiva) return;

    setUserInput('');

    // Agregar mensaje del usuario a la conversación
    setConversation((prev) => [
      ...prev,
      {
        tipo: 'usuario',
        texto: textoEnviado,
        timestamp: new Date()
      }
    ]);

    try {
      const resultado = await interaccionService.enviar({
        sesion_id: sesionActiva.id,
        texto_estudiante: textoEnviado,
        texto_esperado: currentPhrase?.texto || ''
      });

      const puntuacion = Math.round(resultado.puntuacion_general);
      setScore((prev) => Math.round((prev + puntuacion) / 2) || puntuacion);

      setConversation((prev) => [
        ...prev,
        {
          tipo: 'agente',
          texto: resultado.respuesta_texto,
          puntuacion,
          timestamp: new Date()
        }
      ]);

      setAvatarEmotion(mapearEmocionAvatar(resultado.emocion_avatar, puntuacion));
      setAvatarMessage(resultado.respuesta_texto);
      setIsSpeaking(true);

      // Se espera a que termine de hablar de verdad (no un tiempo fijo
      // adivinado) antes de seguir — así la retroalimentación nunca se
      // corta a la mitad.
      if (!isMuted) {
        // La retroalimentación ahora la genera DeepSeek íntegramente en
        // español (ver chatbot/ai.py) — se lee con voz de español, no la
        // de inglés que usa la frase de práctica.
        await hablar(resultado.respuesta_texto, { lang: 'es-ES' });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setIsSpeaking(false);
      setAvatarMessage('');

      // `necesita_repetir` ya lo calcula el backend con el mismo umbral
      // (puntuación general < 70): si la pronunciación no alcanzó, se
      // reintenta la MISMA frase en vez de avanzar a una nueva.
      if (resultado.necesita_repetir) {
        await repetirFrase();
      } else {
        await mostrarSiguienteFrase(sesionActiva.id);
      }
    } catch (err) {
      console.error('No se pudo procesar la interacción', err);
      setConversation((prev) => [
        ...prev,
        {
          tipo: 'agente',
          texto: 'No pude procesar tu respuesta. Intenta de nuevo.',
          timestamp: new Date()
        }
      ]);
    }
  };

  // Grabar y transcribir la voz del estudiante (Web Speech API — el audio
  // no sale del navegador, solo el texto transcrito llega al backend).
  const toggleRecording = () => {
    if (isRecording) {
      reconocimientoRef.current?.stop();
      return;
    }

    if (!reconocimientoRef.current) {
      reconocimientoRef.current = crearReconocimiento();
    }
    const reconocimiento = reconocimientoRef.current;

    if (!reconocimiento) {
      setErrorVoz(
        'Tu navegador no soporta reconocimiento de voz. Probá con Chrome o Edge, o escribí tu respuesta.'
      );
      return;
    }

    setErrorVoz('');
    reconocimiento.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      // Foco principal: se envía apenas se transcribe, sin pasar por el
      // botón de enviar (se le pasa el texto directo, no por el estado
      // `userInput`, para no depender de que el re-render ya haya corrido).
      enviarRespuesta(texto);
    };
    reconocimiento.onerror = () => {
      setIsRecording(false);
      setErrorVoz('No se pudo escuchar. Revisá el permiso del micrófono e intentá de nuevo.');
    };
    reconocimiento.onend = () => {
      setIsRecording(false);
    };

    setIsRecording(true);
    reconocimiento.start();
  };

  // Finalizar sesión (POST /api/sesiones/<id>/finalizar/)
  const finalizarSesion = async () => {
    if (sesionActiva) {
      try {
        await sesionesService.finalizar(sesionActiva.id);
      } catch (err) {
        console.error('No se pudo finalizar la sesión en el servidor', err);
      }
    }

    setSesionActiva(null);
    setView('list');
    setCurrentPhrase(null);
    setConversation([]);
    setAvatarMessage('');
    setLoadingSesiones(true);
    setErrorSesiones('');
    listarSesiones();
  };

  /* ==========================================================
     Vista: lista de sesiones
     ========================================================== */
  if (view === 'list') {
    return (
      <div className="max-w-5xl space-y-6 animate-fadeIn">
        {/* Encabezado de página */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-mk-ink">
              Sesiones de práctica
            </h2>
            <p className="mt-1 text-sm text-mk-muted">
              Conversa con el tutor virtual y recibe evaluación inmediata de tu
              pronunciación.
            </p>
          </div>
          <button
            onClick={() => setShowNewSessionModal(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-mk-gold text-mk-ink text-sm font-semibold hover:bg-mk-gold-dark transition-colors"
          >
            <Plus className="w-[18px] h-[18px]" />
            Nueva sesión
          </button>
        </div>

        {/* Historial */}
        <section className="bg-mk-surface border border-mk-line rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-mk-line">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-muted">
              Historial reciente
            </h3>
          </div>

          {loadingSesiones ? (
            <p className="px-5 py-8 text-sm text-mk-muted text-center">Cargando historial…</p>
          ) : errorSesiones ? (
            <p className="px-5 py-8 text-sm text-mk-error text-center">{errorSesiones}</p>
          ) : sesiones.length === 0 ? (
            <p className="px-5 py-8 text-sm text-mk-muted text-center">
              Todavía no tienes sesiones. Crea la primera con "Nueva sesión".
            </p>
          ) : (
            <ul className="divide-y divide-mk-line">
              {sesiones.map((sesion) => (
                <li key={sesion.id}>
                  <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-mk-ice transition-colors group">
                    <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-mk-ink truncate">
                          {sesion.titulo}
                        </h4>
                        {sesion.nivel_dificultad && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded border border-mk-line text-[11px] font-semibold text-mk-muted">
                            {sesion.nivel_dificultad}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-mk-muted truncate">
                        {sesion.tema_practica} · {sesion.duracion_minutos} min ·{' '}
                        {formatearFecha(sesion.fecha_inicio)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-md text-sm font-semibold tabular-nums ${estiloPuntuacion(
                        sesion.puntuacion_sesion
                      )}`}
                    >
                      {Math.round(sesion.puntuacion_sesion)}%
                    </span>

                    <ChevronRight className="w-4 h-4 shrink-0 text-mk-line group-hover:text-mk-blue transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Modal: nueva sesión */}
        {showNewSessionModal && (
          <div
            className="fixed inset-0 bg-mk-ink/40 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewSessionModal(false)}
          >
            <div
              className="bg-mk-surface rounded-lg border border-mk-line shadow-lg max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-mk-line flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-mk-ink">
                    Nueva sesión
                  </h3>
                  <p className="mt-0.5 text-sm text-mk-muted">
                    Elige el tema que quieres practicar hoy.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewSessionModal(false)}
                  className="w-9 h-9 shrink-0 rounded-md flex items-center justify-center text-mk-muted hover:bg-mk-ice hover:text-mk-ink transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
                {temasDisponibles.map((tema) => {
                  const { Icono } = tema;
                  return (
                    <button
                      key={tema.id}
                      onClick={() => iniciarSesion(tema)}
                      className="p-4 rounded-md border border-mk-line bg-mk-surface hover:border-mk-blue hover:bg-mk-blue-soft transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 shrink-0 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center">
                          <Icono className="w-[18px] h-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-mk-ink">
                              {tema.nombre}
                            </h4>
                            <span className="shrink-0 px-1.5 py-0.5 rounded bg-mk-surface border border-mk-line text-[11px] font-semibold text-mk-muted">
                              {tema.nivel}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-mk-muted">
                            {tema.descripcion}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ==========================================================
     Vista: sesión activa
     ========================================================== */
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 animate-fadeIn">
      {/* Barra de sesión */}
      <div className="bg-mk-surface border border-mk-line rounded-lg px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md bg-mk-blue-soft text-mk-blue flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-mk-ink truncate">
                  {sesionActiva?.tema_practica}
                </h2>
                <span className="shrink-0 px-1.5 py-0.5 rounded border border-mk-line text-[11px] font-semibold text-mk-muted">
                  {sesionActiva?.nivel_dificultad}
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.06em] text-mk-muted">
                {isPaused ? 'En pausa' : 'Sesión en curso'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cronómetro */}
            <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-mk-ice border border-mk-line">
              <Clock className="w-4 h-4 text-mk-muted" />
              <span className="font-mono text-sm font-semibold text-mk-ink tabular-nums">
                {formatTime(sessionTime)}
              </span>
            </div>

            {/* Puntuación */}
            <div
              className={`flex items-center h-9 px-3 rounded-md text-sm font-semibold tabular-nums ${
                score ? estiloPuntuacion(score) : 'bg-mk-ice text-mk-muted'
              }`}
            >
              {score}% precisión
            </div>

            <div className="w-px h-6 bg-mk-line mx-1" />

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-9 h-9 rounded-md border border-mk-line flex items-center justify-center text-mk-muted hover:bg-mk-ice hover:text-mk-ink transition-colors"
              title={isPaused ? 'Reanudar' : 'Pausar'}
            >
              {isPaused ? (
                <Play className="w-[18px] h-[18px]" />
              ) : (
                <Pause className="w-[18px] h-[18px]" />
              )}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-9 h-9 rounded-md border border-mk-line flex items-center justify-center text-mk-muted hover:bg-mk-ice hover:text-mk-ink transition-colors"
              title={isMuted ? 'Activar audio' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="w-[18px] h-[18px]" />
              ) : (
                <Volume2 className="w-[18px] h-[18px]" />
              )}
            </button>
            <button
              onClick={finalizarSesion}
              className="h-9 px-3 rounded-md border border-mk-line text-sm font-semibold text-mk-muted hover:bg-mk-error-bg hover:border-mk-error hover:text-mk-error transition-colors"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>

      {/* Área de trabajo */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Avatar */}
        <div className="bg-mk-surface border border-mk-line rounded-lg overflow-hidden">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-sm text-mk-muted">
                Cargando tutor…
              </div>
            }
          >
            <Avatar
              speaking={isSpeaking}
              emotion={avatarEmotion}
              message={avatarMessage}
              height="100%"
            />
          </Suspense>
        </div>

        {/* Conversación */}
        <div className="bg-mk-surface border border-mk-line rounded-lg flex flex-col overflow-hidden">
          {/* Frase a practicar */}
          {currentPhrase ? (
            <div className="px-5 py-4 bg-mk-blue-soft border-b border-mk-line">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mk-blue">
                Repite esta frase
              </p>
              <p className="mt-1.5 font-display text-xl font-semibold text-mk-ink">
                {currentPhrase.texto}
              </p>
              <p className="mt-0.5 text-sm text-mk-muted">
                {currentPhrase.traduccion}
              </p>
            </div>
          ) : (
            cargandoFrase && (
              <div className="px-5 py-4 bg-mk-blue-soft border-b border-mk-line">
                <p className="text-sm text-mk-muted">Generando frase…</p>
              </div>
            )
          )}

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {conversation.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-8 h-8 text-mk-line mx-auto mb-3" />
                  <p className="text-sm text-mk-muted">
                    Tu conversación aparecerá aquí
                  </p>
                </div>
              </div>
            ) : (
              conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 text-sm ${
                      msg.tipo === 'usuario'
                        ? 'bg-mk-blue text-white rounded-lg rounded-br-sm'
                        : 'bg-mk-ice border border-mk-line text-mk-ink rounded-lg rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.texto}</p>
                    {msg.puntuacion && (
                      <p
                        className={`mt-1 text-[11px] font-semibold tabular-nums ${
                          msg.puntuacion >= 85
                            ? 'text-mk-success'
                            : 'text-mk-streak-ink'
                        }`}
                      >
                        Precisión {msg.puntuacion}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={conversationEndRef} />
          </div>

          {/* Entrada */}
          <div className="p-4 border-t border-mk-line space-y-3">
            {errorVoz && (
              <p className="text-xs text-mk-error text-center animate-fadeIn">{errorVoz}</p>
            )}

            {/* Foco principal: grabar. Al transcribir se envía solo, sin
                pasar por el botón de enviar (ver toggleRecording). */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm transition-all ${
                  isRecording
                    ? 'bg-mk-error text-white scale-105 animate-pulse'
                    : 'bg-mk-gold text-mk-ink hover:bg-mk-gold-dark'
                }`}
                title={isRecording ? 'Detener grabación' : 'Grabar respuesta'}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
              <p className="text-xs font-medium text-mk-muted">
                {isRecording ? 'Escuchando… tocá para detener' : 'Tocá para hablar'}
              </p>
            </div>

            {/* Alternativa manual: escribir en vez de hablar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarRespuesta()}
                placeholder="O escribí tu respuesta"
                className="flex-1 min-w-0 h-10 px-3.5 rounded-md border border-mk-line bg-mk-surface text-sm text-mk-ink placeholder:text-mk-muted focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors"
              />

              <button
                onClick={() => enviarRespuesta()}
                disabled={!userInput.trim()}
                className="w-10 h-10 shrink-0 rounded-md bg-mk-ice text-mk-ink flex items-center justify-center hover:bg-mk-line/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Enviar respuesta"
              >
                <Send className="w-4 h-4" />
              </button>

              <button
                onClick={() => mostrarSiguienteFrase()}
                disabled={cargandoFrase}
                className="w-10 h-10 shrink-0 rounded-md border border-mk-line flex items-center justify-center text-mk-muted hover:bg-mk-ice hover:text-mk-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Siguiente frase"
              >
                <RefreshCw className={`w-4 h-4 ${cargandoFrase ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
