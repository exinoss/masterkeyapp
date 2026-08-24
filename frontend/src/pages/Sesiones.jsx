/**
 * Sesiones — MasterKey
 * Lista de sesiones, selección de tema y sesión activa con el avatar.
 */
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
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
  const conversationEndRef = useRef(null);

  // Datos de demo para sesiones
  const sesionesDemo = [
    {
      id: 1,
      titulo: 'Conversación en restaurante',
      tema: 'Vocabulario de comida',
      fecha: '2024-12-09',
      duracion: 15,
      puntuacion: 85,
      estado: 'completada',
      nivel: 'B1'
    },
    {
      id: 2,
      titulo: 'Entrevista de trabajo',
      tema: 'Inglés profesional',
      fecha: '2024-12-08',
      duracion: 22,
      puntuacion: 72,
      estado: 'completada',
      nivel: 'B2'
    },
    {
      id: 3,
      titulo: 'En el aeropuerto',
      tema: 'Viajes y turismo',
      fecha: '2024-12-07',
      duracion: 18,
      puntuacion: 91,
      estado: 'completada',
      nivel: 'B1'
    }
  ];

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

  // Frases de práctica de demo
  const frasesDemo = [
    { texto: 'Hello, how are you today?', traduccion: 'Hola, ¿cómo estás hoy?' },
    { texto: 'Nice to meet you!', traduccion: '¡Mucho gusto en conocerte!' },
    {
      texto: 'Could you please repeat that?',
      traduccion: '¿Podrías repetir eso por favor?'
    },
    {
      texto: 'I would like to order a coffee.',
      traduccion: 'Me gustaría pedir un café.'
    },
    { texto: 'Thank you very much!', traduccion: '¡Muchas gracias!' }
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

  // Color del indicador de puntuación
  const estiloPuntuacion = (valor) => {
    if (valor >= 85) return 'bg-mk-success-bg text-mk-success';
    if (valor >= 70) return 'bg-mk-streak-bg text-mk-streak-ink';
    return 'bg-mk-error-bg text-mk-error';
  };

  // Iniciar nueva sesión
  const iniciarSesion = (tema) => {
    setSesionActiva({
      id: Date.now(),
      tema: tema.nombre,
      nivel: tema.nivel,
      inicio: new Date()
    });
    setView('session');
    setSessionTime(0);
    setScore(0);
    setConversation([]);
    setShowNewSessionModal(false);

    // Mensaje inicial del avatar
    setTimeout(() => {
      setAvatarEmotion('feliz');
      setAvatarMessage(
        `¡Hola${user?.nombre ? ', ' + user.nombre : ''}! Soy tu tutor de MasterKey. ¿Listo para practicar?`
      );
      setIsSpeaking(true);

      setTimeout(() => {
        setIsSpeaking(false);
        setAvatarMessage('');
        mostrarSiguienteFrase();
      }, 3000);
    }, 1000);
  };

  // Mostrar siguiente frase para practicar
  const mostrarSiguienteFrase = () => {
    const randomFrase = frasesDemo[Math.floor(Math.random() * frasesDemo.length)];
    setCurrentPhrase(randomFrase);
    setAvatarEmotion('neutral');
    setAvatarMessage(`Repite: "${randomFrase.texto}"`);
    setIsSpeaking(true);

    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  // Simular envío de respuesta del usuario
  const enviarRespuesta = () => {
    if (!userInput.trim()) return;

    // Agregar mensaje del usuario a la conversación
    setConversation((prev) => [
      ...prev,
      {
        tipo: 'usuario',
        texto: userInput,
        timestamp: new Date()
      }
    ]);

    // Simular evaluación (rango amplio a propósito: con el 70-100 anterior
    // la puntuación nunca bajaba de 70 y el estado "triste" del avatar
    // jamás se disparaba en la demo)
    const puntuacion = Math.floor(Math.random() * 61) + 40; // 40-100
    setScore((prev) => Math.round((prev + puntuacion) / 2) || puntuacion);

    // Respuesta del avatar
    setTimeout(() => {
      let respuesta = '';
      let emocion = 'neutral';

      if (puntuacion === 100) {
        respuesta = '¡Perfecto! Pronunciación exacta, 100%!';
        emocion = 'superFeliz';
      } else if (puntuacion >= 80) {
        respuesta = '¡Muy bien! Good job, keep practicing!';
        emocion = 'feliz';
      } else {
        respuesta = 'No salió del todo bien. Intentemos de nuevo.';
        emocion = 'triste';
      }

      setConversation((prev) => [
        ...prev,
        {
          tipo: 'agente',
          texto: respuesta,
          puntuacion: puntuacion,
          timestamp: new Date()
        }
      ]);

      setAvatarEmotion(emocion);
      setAvatarMessage(respuesta);
      setIsSpeaking(true);

      setTimeout(() => {
        setIsSpeaking(false);
        setAvatarMessage('');
        mostrarSiguienteFrase();
      }, 3000);
    }, 1000);

    setUserInput('');
  };

  // Simular grabación de voz
  const toggleRecording = () => {
    setIsRecording(!isRecording);

    if (!isRecording) {
      // Simular transcripción después de 2 segundos
      setTimeout(() => {
        if (currentPhrase) {
          setUserInput(currentPhrase.texto);
        }
        setIsRecording(false);
      }, 2000);
    }
  };

  // Finalizar sesión
  const finalizarSesion = () => {
    setSesionActiva(null);
    setView('list');
    setCurrentPhrase(null);
    setConversation([]);
    setAvatarMessage('');
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

          <ul className="divide-y divide-mk-line">
            {sesionesDemo.map((sesion) => (
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
                      <span className="shrink-0 px-1.5 py-0.5 rounded border border-mk-line text-[11px] font-semibold text-mk-muted">
                        {sesion.nivel}
                      </span>
                    </div>
                    <p className="text-sm text-mk-muted truncate">
                      {sesion.tema} · {sesion.duracion} min · {sesion.fecha}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-md text-sm font-semibold tabular-nums ${estiloPuntuacion(
                      sesion.puntuacion
                    )}`}
                  >
                    {sesion.puntuacion}%
                  </span>

                  <ChevronRight className="w-4 h-4 shrink-0 text-mk-line group-hover:text-mk-blue transition-colors" />
                </button>
              </li>
            ))}
          </ul>
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
                  {sesionActiva?.tema}
                </h2>
                <span className="shrink-0 px-1.5 py-0.5 rounded border border-mk-line text-[11px] font-semibold text-mk-muted">
                  {sesionActiva?.nivel}
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
          {currentPhrase && (
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
          <div className="p-3 border-t border-mk-line">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleRecording}
                className={`w-11 h-11 shrink-0 rounded-md flex items-center justify-center transition-colors ${
                  isRecording
                    ? 'bg-mk-error-bg text-mk-error border border-mk-error animate-pulse'
                    : 'border border-mk-line text-mk-muted hover:bg-mk-ice hover:text-mk-ink'
                }`}
                title={isRecording ? 'Detener grabación' : 'Grabar respuesta'}
              >
                {isRecording ? (
                  <MicOff className="w-[18px] h-[18px]" />
                ) : (
                  <Mic className="w-[18px] h-[18px]" />
                )}
              </button>

              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarRespuesta()}
                placeholder="Escribe tu respuesta o usa el micrófono"
                className="flex-1 min-w-0 h-11 px-3.5 rounded-md border border-mk-line bg-mk-surface text-sm text-mk-ink placeholder:text-mk-muted focus:border-mk-blue focus:ring-2 focus:ring-mk-blue/15 outline-none transition-colors"
              />

              <button
                onClick={enviarRespuesta}
                disabled={!userInput.trim()}
                className="w-11 h-11 shrink-0 rounded-md bg-mk-gold text-mk-ink flex items-center justify-center hover:bg-mk-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-mk-gold"
                title="Enviar respuesta"
              >
                <Send className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={mostrarSiguienteFrase}
                className="w-11 h-11 shrink-0 rounded-md border border-mk-line flex items-center justify-center text-mk-muted hover:bg-mk-ice hover:text-mk-ink transition-colors"
                title="Siguiente frase"
              >
                <RefreshCw className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
