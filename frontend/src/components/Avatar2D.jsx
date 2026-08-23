/**
 * Componente Avatar 2D Animado - Estilo Cartoon Premium
 * Un avatar atractivo y profesional con animaciones suaves
 */
import { useState, useEffect } from 'react';

export default function Avatar2D({ 
  speaking = false, 
  emotion = 'neutral', 
  message = '',
  className = '',
  height = '400px'
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  
  // Parpadeo automático
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    
    return () => clearInterval(blinkInterval);
  }, []);
  
  // Animación de boca al hablar
  useEffect(() => {
    if (speaking) {
      const mouthInterval = setInterval(() => {
        setMouthOpen(Math.random());
      }, 100);
      return () => clearInterval(mouthInterval);
    } else {
      setMouthOpen(0);
    }
  }, [speaking]);

  // Animación de cabeza sutil
  useEffect(() => {
    const headInterval = setInterval(() => {
      setHeadTilt(Math.sin(Date.now() / 1000) * 2);
    }, 50);
    return () => clearInterval(headInterval);
  }, []);

  // Obtener forma de ojos según estado
  const getEyeScaleY = () => {
    if (isBlinking) return 0.1;
    if (emotion === 'feliz') return 0.8;
    return 1;
  };

  // Obtener altura de boca
  const getMouthHeight = () => {
    if (speaking) return 8 + mouthOpen * 15;
    if (emotion === 'feliz' || emotion === 'animando') return 12;
    return 6;
  };

  const getMouthCurve = () => {
    if (emotion === 'feliz' || emotion === 'animando') return 8;
    if (emotion === 'pensativo') return -2;
    return 4;
  };

  return (
    <div className={`relative w-full flex flex-col items-center justify-center overflow-hidden ${className}`} style={{ height }}>
      {/* Fondo con gradiente */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #E8F4F8 0%, #DEEFE7 50%, #E8F4F8 100%)'
        }}
      />
      
      {/* Partículas decorativas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              background: 'linear-gradient(135deg, #159A9C, #20B2B4)',
              opacity: 0.3,
              top: `${10 + i * 15}%`,
              left: `${5 + (i % 2) * 80}%`,
              animation: `float ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Mensaje del avatar */}
      {message && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-[#159A9C]/20 max-w-xs text-center relative">
            <p className="text-sm text-[#002333] font-medium">{message}</p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-[#159A9C]/20" />
          </div>
        </div>
      )}
      
      {/* Avatar SVG */}
      <div 
        className="relative z-10"
        style={{
          transform: `translateY(${Math.sin(Date.now() / 500) * 3}px) rotate(${headTilt}deg)`,
          filter: 'drop-shadow(0 10px 25px rgba(0, 35, 51, 0.15))'
        }}
      >
        <svg 
          viewBox="0 0 200 260" 
          width="280"
          height="350"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradientes */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE4D6" />
              <stop offset="100%" stopColor="#FFDAB9" />
            </linearGradient>
            
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#20B2B4" />
              <stop offset="50%" stopColor="#159A9C" />
              <stop offset="100%" stopColor="#0D7577" />
            </linearGradient>
            
            <linearGradient id="sweaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#003344" />
              <stop offset="100%" stopColor="#002333" />
            </linearGradient>
            
            <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFB6C1" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#25C5C7" />
              <stop offset="100%" stopColor="#159A9C" />
            </linearGradient>
          </defs>
          
          {/* ====== CUERPO / SUÉTER ====== */}
          <g>
            {/* Cuello */}
            <ellipse cx="100" cy="175" rx="18" ry="12" fill="url(#skinGrad)" />
            
            {/* Suéter base */}
            <path 
              d="M45 260 Q45 200 65 190 Q80 185 100 183 Q120 185 135 190 Q155 200 155 260 Z"
              fill="url(#sweaterGrad)"
            />
            
            {/* Cuello del suéter */}
            <ellipse cx="100" cy="188" rx="28" ry="12" fill="#003D4D" />
            <ellipse cx="100" cy="185" rx="22" ry="8" fill="#002333" />
            
            {/* Patrón del suéter */}
            <g stroke="#0A4D5E" strokeWidth="1.5" opacity="0.3" fill="none">
              <path d="M55 210 Q100 205 145 210" />
              <path d="M50 230 Q100 225 150 230" />
              <path d="M48 250 Q100 245 152 250" />
            </g>
          </g>
          
          {/* ====== CABEZA ====== */}
          <g>
            {/* Cara base - óvalo suave */}
            <ellipse 
              cx="100" 
              cy="105" 
              rx="58" 
              ry="65" 
              fill="url(#skinGrad)"
            />
            
            {/* Sombra suave de la cara */}
            <ellipse 
              cx="100" 
              cy="140" 
              rx="45" 
              ry="25" 
              fill="#E8C4A0"
              opacity="0.3"
            />
            
            {/* Mejillas sonrojadas */}
            <ellipse cx="55" cy="120" rx="14" ry="10" fill="url(#cheekGrad)" />
            <ellipse cx="145" cy="120" rx="14" ry="10" fill="url(#cheekGrad)" />
          </g>
          
          {/* ====== CABELLO ====== */}
          <g>
            {/* Base del cabello */}
            <ellipse 
              cx="100" 
              cy="60" 
              rx="62" 
              ry="45" 
              fill="url(#hairGrad)"
            />
            
            {/* Parte superior voluminosa */}
            <ellipse cx="100" cy="45" rx="55" ry="35" fill="#159A9C" />
            
            {/* Mechón frontal izquierdo */}
            <path 
              d="M50 65 Q35 40 45 20 Q60 25 68 50 Q70 65 60 75 Z"
              fill="url(#hairHighlight)"
            />
            
            {/* Mechón frontal central */}
            <path 
              d="M90 50 Q95 15 100 10 Q105 15 110 50 Q105 55 100 53 Q95 55 90 50 Z"
              fill="#20B2B4"
            />
            
            {/* Mechón frontal derecho */}
            <path 
              d="M150 65 Q165 40 155 20 Q140 25 132 50 Q130 65 140 75 Z"
              fill="#0D7577"
            />
            
            {/* Mechones laterales */}
            <ellipse cx="38" cy="85" rx="15" ry="25" fill="#159A9C" />
            <ellipse cx="162" cy="85" rx="15" ry="25" fill="#0D7577" />
            
            {/* Flequillo ondulado */}
            <path 
              d="M42 70 Q55 60 75 65 Q90 55 100 60 Q110 55 125 65 Q145 60 158 70 Q150 85 100 80 Q50 85 42 70"
              fill="#20B2B4"
            />
          </g>
          
          {/* ====== OREJAS ====== */}
          <ellipse cx="42" cy="105" rx="8" ry="12" fill="url(#skinGrad)" />
          <ellipse cx="158" cy="105" rx="8" ry="12" fill="url(#skinGrad)" />
          
          {/* ====== OJOS ====== */}
          <g>
            {/* Ojo izquierdo */}
            <g transform={`translate(70, 100) scale(1, ${getEyeScaleY()})`}>
              <ellipse cx="0" cy="0" rx="15" ry="17" fill="white" />
              <ellipse cx="2" cy="2" rx="9" ry="10" fill="#3D2314" />
              <ellipse cx="3" cy="3" rx="4" ry="5" fill="#1A0F0A" />
              <ellipse cx="5" cy="-3" rx="4" ry="4" fill="white" />
              <ellipse cx="-2" cy="4" rx="2" ry="2" fill="white" opacity="0.6" />
            </g>
            
            {/* Ojo derecho */}
            <g transform={`translate(130, 100) scale(1, ${getEyeScaleY()})`}>
              <ellipse cx="0" cy="0" rx="15" ry="17" fill="white" />
              <ellipse cx="-2" cy="2" rx="9" ry="10" fill="#3D2314" />
              <ellipse cx="-3" cy="3" rx="4" ry="5" fill="#1A0F0A" />
              <ellipse cx="-1" cy="-3" rx="4" ry="4" fill="white" />
              <ellipse cx="2" cy="4" rx="2" ry="2" fill="white" opacity="0.6" />
            </g>
          </g>
          
          {/* ====== CEJAS ====== */}
          <g stroke="#0D7577" strokeWidth="4" strokeLinecap="round" fill="none">
            <path 
              d={emotion === 'pensativo' 
                ? "M55 82 Q65 85 82 83" 
                : emotion === 'feliz' || emotion === 'animando'
                  ? "M55 85 Q65 80 82 82"
                  : "M55 83 Q65 81 82 83"
              } 
            />
            <path 
              d={emotion === 'pensativo' 
                ? "M118 83 Q135 85 145 82" 
                : emotion === 'feliz' || emotion === 'animando'
                  ? "M118 82 Q135 80 145 85"
                  : "M118 83 Q135 81 145 83"
              } 
            />
          </g>
          
          {/* ====== NARIZ ====== */}
          <ellipse cx="100" cy="125" rx="5" ry="4" fill="#E8C4A0" />
          
          {/* ====== BOCA ====== */}
          <g>
            {speaking ? (
              // Boca hablando
              <ellipse 
                cx="100" 
                cy="145" 
                rx="12" 
                ry={getMouthHeight()} 
                fill="#C75050"
              />
            ) : (
              // Boca sonriendo
              <path 
                d={`M82 143 Q100 ${143 + getMouthCurve()} 118 143`}
                stroke="#E88B8B"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            )}
            
            {/* Interior de la boca (cuando habla) */}
            {speaking && mouthOpen > 0.3 && (
              <ellipse 
                cx="100" 
                cy="147" 
                rx="8" 
                ry={getMouthHeight() * 0.5} 
                fill="#8B4040"
              />
            )}
          </g>
          
          {/* Brillos decorativos en el cabello */}
          <ellipse cx="70" cy="35" rx="8" ry="4" fill="white" opacity="0.2" />
          <ellipse cx="120" cy="30" rx="6" ry="3" fill="white" opacity="0.15" />
        </svg>
      </div>
      
      {/* Indicador de estado */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-20">
        <div 
          className={`w-3 h-3 rounded-full transition-all ${
            speaking 
              ? 'bg-green-500 shadow-lg shadow-green-500/50' 
              : 'bg-[#B4BEC9]'
          }`}
          style={{
            animation: speaking ? 'pulse 1s ease-in-out infinite' : 'none'
          }}
        />
        <span className="text-sm text-[#002333] font-medium">
          {speaking ? 'AVI está hablando...' : 'Esperando...'}
        </span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-15px); opacity: 0.5; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
