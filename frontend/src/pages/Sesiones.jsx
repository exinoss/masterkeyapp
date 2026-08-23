/**
 * Página de Sesiones - Con Avatar 2D Animado
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar2D from '../components/Avatar2D';
import { 
  MessageSquare, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff,
  Send,
  Clock,
  Award,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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
    { id: 1, nombre: 'Saludos y Presentaciones', nivel: 'A1', descripcion: 'Aprende a saludar y presentarte en inglés', icono: '👋' },
    { id: 2, nombre: 'En el Restaurante', nivel: 'A2', descripcion: 'Vocabulario para ordenar comida', icono: '🍽️' },
    { id: 3, nombre: 'Entrevista de Trabajo', nivel: 'B1', descripcion: 'Prepárate para entrevistas laborales', icono: '💼' },
    { id: 4, nombre: 'Viajes y Aeropuerto', nivel: 'B1', descripcion: 'Situaciones comunes al viajar', icono: '✈️' },
    { id: 5, nombre: 'Conversación Telefónica', nivel: 'B2', descripcion: 'Habla por teléfono con confianza', icono: '📞' },
    { id: 6, nombre: 'Debate y Opiniones', nivel: 'C1', descripcion: 'Expresa y defiende tus ideas', icono: '💬' }
  ];

  // Frases de práctica de demo
  const frasesDemo = [
    { texto: "Hello, how are you today?", traduccion: "Hola, ¿cómo estás hoy?" },
    { texto: "Nice to meet you!", traduccion: "¡Mucho gusto en conocerte!" },
    { texto: "Could you please repeat that?", traduccion: "¿Podrías repetir eso por favor?" },
    { texto: "I would like to order a coffee.", traduccion: "Me gustaría pedir un café." },
    { texto: "Thank you very much!", traduccion: "¡Muchas gracias!" }
  ];

  // Timer de sesión
  useEffect(() => {
    let interval;
    if (sesionActiva && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sesionActiva, isPaused]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      setAvatarMessage("¡Hola! Soy AVI, tu asistente de inglés. ¿Listo para practicar?");
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
    setConversation(prev => [...prev, {
      tipo: 'usuario',
      texto: userInput,
      timestamp: new Date()
    }]);

    // Simular evaluación
    const puntuacion = Math.floor(Math.random() * 30) + 70; // 70-100
    setScore(prev => Math.round((prev + puntuacion) / 2) || puntuacion);

    // Respuesta del avatar
    setTimeout(() => {
      let respuesta = '';
      let emocion = 'neutral';

      if (puntuacion >= 90) {
        respuesta = "¡Excelente pronunciación! 🌟 You did great!";
        emocion = 'feliz';
      } else if (puntuacion >= 75) {
        respuesta = "¡Muy bien! Good job, keep practicing!";
        emocion = 'feliz';
      } else {
        respuesta = "Good try! Let's practice that again.";
        emocion = 'animando';
      }

      setConversation(prev => [...prev, {
        tipo: 'agente',
        texto: respuesta,
        puntuacion: puntuacion,
        timestamp: new Date()
      }]);

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

  // Vista de lista de sesiones
  if (view === 'list') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#002333]">Sesiones</h1>
            <p className="text-[#B4BEC9]">Practica tu inglés con el agente virtual</p>
          </div>
          <button 
            onClick={() => setShowNewSessionModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#159A9C] text-white rounded-xl font-medium hover:bg-[#002333] transition-all shadow-lg hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Nueva Sesión
          </button>
        </div>

        {/* Lista de sesiones */}
        <div className="grid gap-4">
          {sesionesDemo.map((sesion) => (
            <div 
              key={sesion.id}
              className="bg-white rounded-2xl p-6 border border-[#B4BEC9]/20 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#159A9C] to-[#002333] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#002333] text-lg">{sesion.titulo}</h3>
                  <p className="text-[#B4BEC9] text-sm">{sesion.tema} • Nivel {sesion.nivel}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#159A9C]">{sesion.puntuacion}%</p>
                  <p className="text-xs text-[#B4BEC9]">{sesion.duracion} min</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#B4BEC9] group-hover:text-[#159A9C] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Modal Nueva Sesión */}
        {showNewSessionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-[#B4BEC9]/20 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#002333]">Selecciona un Tema</h2>
                <button 
                  onClick={() => setShowNewSessionModal(false)}
                  className="p-2 rounded-lg hover:bg-[#DEEFE7] transition-colors"
                >
                  <X className="w-5 h-5 text-[#002333]" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {temasDisponibles.map((tema) => (
                  <button
                    key={tema.id}
                    onClick={() => iniciarSesion(tema)}
                    className="p-4 rounded-xl border border-[#B4BEC9]/20 hover:border-[#159A9C] hover:bg-[#DEEFE7]/30 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{tema.icono}</span>
                      <div>
                        <h3 className="font-semibold text-[#002333] group-hover:text-[#159A9C]">
                          {tema.nombre}
                        </h3>
                        <p className="text-xs text-[#B4BEC9] mb-2">Nivel {tema.nivel}</p>
                        <p className="text-sm text-[#B4BEC9]">{tema.descripcion}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista de sesión activa
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fadeIn">
      {/* Header de sesión */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-[#B4BEC9]/20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-[#159A9C]/10">
              <MessageSquare className="w-5 h-5 text-[#159A9C]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#002333]">{sesionActiva?.tema}</h2>
              <p className="text-sm text-[#B4BEC9]">Nivel {sesionActiva?.nivel}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#DEEFE7] rounded-xl">
              <Clock className="w-4 h-4 text-[#159A9C]" />
              <span className="font-mono font-semibold text-[#002333]">{formatTime(sessionTime)}</span>
            </div>
            
            {/* Score */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#159A9C]/10 rounded-xl">
              <Award className="w-4 h-4 text-[#159A9C]" />
              <span className="font-semibold text-[#159A9C]">{score}%</span>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-xl hover:bg-[#DEEFE7] transition-colors"
                title={isPaused ? 'Reanudar' : 'Pausar'}
              >
                {isPaused ? <Play className="w-5 h-5 text-[#002333]" /> : <Pause className="w-5 h-5 text-[#002333]" />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl hover:bg-[#DEEFE7] transition-colors"
                title={isMuted ? 'Activar audio' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-[#002333]" /> : <Volume2 className="w-5 h-5 text-[#002333]" />}
              </button>
              <button
                onClick={finalizarSesion}
                className="p-2 rounded-xl hover:bg-red-100 transition-colors"
                title="Finalizar sesión"
              >
                <Square className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Panel del Avatar */}
        <div className="bg-gradient-to-br from-[#DEEFE7] via-white to-[#DEEFE7] rounded-2xl border border-[#B4BEC9]/20 shadow-sm overflow-hidden">
          <Avatar2D 
            speaking={isSpeaking} 
            emotion={avatarEmotion}
            message={avatarMessage}
            height="100%"
          />
        </div>

        {/* Panel de Conversación */}
        <div className="bg-white rounded-2xl border border-[#B4BEC9]/20 shadow-sm flex flex-col overflow-hidden">
          {/* Frase a practicar */}
          {currentPhrase && (
            <div className="p-4 bg-[#002333] text-white">
              <p className="text-sm text-white/60 mb-1">Repite esta frase:</p>
              <p className="text-lg font-medium">{currentPhrase.texto}</p>
              <p className="text-sm text-white/60 mt-1">({currentPhrase.traduccion})</p>
            </div>
          )}

          {/* Conversación */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-[#B4BEC9] mx-auto mb-3" />
                  <p className="text-[#B4BEC9]">La conversación aparecerá aquí</p>
                </div>
              </div>
            ) : (
              conversation.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.tipo === 'usuario' 
                      ? 'bg-[#159A9C] text-white rounded-br-none' 
                      : 'bg-[#DEEFE7] text-[#002333] rounded-bl-none'
                  }`}>
                    <p>{msg.texto}</p>
                    {msg.puntuacion && (
                      <p className={`text-xs mt-1 ${msg.tipo === 'usuario' ? 'text-white/70' : 'text-[#159A9C]'}`}>
                        Puntuación: {msg.puntuacion}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input de usuario */}
          <div className="p-4 border-t border-[#B4BEC9]/20">
            <div className="flex items-center gap-3">
              {/* Botón de micrófono */}
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-xl transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-[#DEEFE7] text-[#002333] hover:bg-[#159A9C] hover:text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Input de texto */}
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarRespuesta()}
                placeholder="Escribe o usa el micrófono..."
                className="flex-1 px-4 py-3 rounded-xl border border-[#B4BEC9]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 outline-none transition-all"
              />

              {/* Botón de enviar */}
              <button
                onClick={enviarRespuesta}
                disabled={!userInput.trim()}
                className="p-3 rounded-xl bg-[#159A9C] text-white hover:bg-[#002333] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>

              {/* Botón de siguiente */}
              <button
                onClick={mostrarSiguienteFrase}
                className="p-3 rounded-xl bg-[#DEEFE7] text-[#002333] hover:bg-[#159A9C] hover:text-white transition-all"
                title="Siguiente frase"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
