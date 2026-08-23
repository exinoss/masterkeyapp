/**
 * Componente Avatar 3D Estilo Cartoon/Pixar
 * Representa al agente virtual AVI con un look moderno y atractivo
 */
import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Html,
  MeshTransmissionMaterial,
  Float
} from '@react-three/drei';
import * as THREE from 'three';

// Avatar estilo cartoon/Pixar
function CartoonAvatar({ speaking, emotion, scale = 1 }) {
  const group = useRef();
  const headRef = useRef();
  const hairRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mouthRef = useRef();
  const leftBrowRef = useRef();
  const rightBrowRef = useRef();
  
  const [blinkTimer, setBlinkTimer] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Colores del avatar - Estilo vibrante
  const colors = {
    skin: '#FFDBAC',
    skinDark: '#E8C4A0',
    cheeks: '#FFB6C1',
    hair: '#159A9C', // Color teal de AVI
    hairHighlight: '#20B2B4',
    sweater: '#002333', // Color oscuro de AVI
    sweaterPattern: '#0A3D4D',
    eyes: '#2C1810',
    eyeWhite: '#FFFFFF',
    eyeHighlight: '#FFFFFF',
    lips: '#E88B8B',
    brows: '#0D7577'
  };

  // Animación continua
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Movimiento suave de respiración y flotación
    if (group.current) {
      group.current.position.y = Math.sin(time * 1.2) * 0.03;
      group.current.rotation.y = Math.sin(time * 0.4) * 0.08;
    }

    // Movimiento de cabeza sutil
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(time * 0.7) * 0.04;
      headRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
      
      // Movimiento más pronunciado al hablar
      if (speaking) {
        headRef.current.rotation.x += Math.sin(time * 2) * 0.03;
      }
    }

    // Movimiento del cabello
    if (hairRef.current) {
      hairRef.current.rotation.z = Math.sin(time * 1.5) * 0.02;
    }

    // Parpadeo de ojos
    setBlinkTimer(prev => prev + delta);
    if (blinkTimer > 2.5 + Math.random() * 2) {
      setIsBlinking(true);
      setBlinkTimer(0);
      setTimeout(() => setIsBlinking(false), 100);
    }

    // Escala de ojos al parpadear
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkScale = isBlinking ? 0.1 : 1;
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, blinkScale, 0.3);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkScale, 0.3);
    }

    // Animación de boca al hablar
    if (mouthRef.current) {
      if (speaking) {
        const mouthOpen = Math.abs(Math.sin(time * 15)) * 0.4 + 0.2;
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, mouthOpen + 0.5, 0.2);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1.2, 0.1);
      } else {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.3, 0.1);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1, 0.1);
      }
    }

    // Animación de cejas según emoción
    if (leftBrowRef.current && rightBrowRef.current) {
      let browAngle = 0;
      let browY = 0;
      
      switch (emotion) {
        case 'feliz':
          browAngle = 0.1;
          browY = 0.02;
          break;
        case 'pensativo':
          browAngle = -0.15;
          browY = -0.02;
          break;
        case 'animando':
          browAngle = 0.2;
          browY = 0.03;
          break;
        default:
          browAngle = 0;
          browY = 0;
      }
      
      leftBrowRef.current.rotation.z = THREE.MathUtils.lerp(leftBrowRef.current.rotation.z, browAngle, 0.1);
      rightBrowRef.current.rotation.z = THREE.MathUtils.lerp(rightBrowRef.current.rotation.z, -browAngle, 0.1);
      leftBrowRef.current.position.y = THREE.MathUtils.lerp(leftBrowRef.current.position.y, 0.42 + browY, 0.1);
      rightBrowRef.current.position.y = THREE.MathUtils.lerp(rightBrowRef.current.position.y, 0.42 + browY, 0.1);
    }
  });

  // Determinar forma de boca según emoción
  const getMouthShape = () => {
    switch (emotion) {
      case 'feliz':
        return { width: 0.18, height: 0.08, curve: 0.15 };
      case 'pensativo':
        return { width: 0.12, height: 0.04, curve: -0.05 };
      case 'animando':
        return { width: 0.2, height: 0.1, curve: 0.2 };
      default:
        return { width: 0.14, height: 0.05, curve: 0.08 };
    }
  };

  const mouth = getMouthShape();

  return (
    <group ref={group} scale={scale} position={[0, -0.3, 0]}>
      {/* ==================== CUERPO / SWEATER ==================== */}
      <group position={[0, -0.7, 0]}>
        {/* Cuerpo principal - Suéter cuello alto estilo cartoon */}
        <mesh>
          <cylinderGeometry args={[0.45, 0.55, 0.8, 32, 1, true]} />
          <meshStandardMaterial 
            color={colors.sweater} 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Parte superior del suéter */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.45, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={colors.sweater} roughness={0.8} />
        </mesh>
        
        {/* Base del suéter */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.55, 0.52, 0.1, 32]} />
          <meshStandardMaterial color={colors.sweater} roughness={0.8} />
        </mesh>
        
        {/* Cuello del suéter */}
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 0.25, 32]} />
          <meshStandardMaterial color={colors.sweater} roughness={0.7} />
        </mesh>
        
        {/* Líneas decorativas del suéter (textura) */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, -0.3 + i * 0.15, 0]}>
            <torusGeometry args={[0.48 + i * 0.01, 0.008, 8, 48]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={colors.sweaterPattern} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ==================== CUELLO ==================== */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.15, 32]} />
        <meshStandardMaterial color={colors.skin} roughness={0.6} />
      </mesh>

      {/* ==================== CABEZA ==================== */}
      <group ref={headRef} position={[0, 0.35, 0]}>
        {/* Cabeza base - forma ovalada estilo cartoon */}
        <mesh>
          <sphereGeometry args={[0.42, 64, 64]} />
          <meshStandardMaterial 
            color={colors.skin} 
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>
        
        {/* Mejillas sonrojadas */}
        <mesh position={[-0.25, -0.05, 0.32]} rotation={[0, 0.3, 0]}>
          <circleGeometry args={[0.08, 32]} />
          <meshStandardMaterial 
            color={colors.cheeks} 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0.25, -0.05, 0.32]} rotation={[0, -0.3, 0]}>
          <circleGeometry args={[0.08, 32]} />
          <meshStandardMaterial 
            color={colors.cheeks} 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* ==================== CABELLO ESTILIZADO ==================== */}
        <group ref={hairRef}>
          {/* Base del cabello */}
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.44, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
            <meshStandardMaterial color={colors.hair} roughness={0.4} metalness={0.2} />
          </mesh>
          
          {/* Mechón frontal grande */}
          <mesh position={[0.1, 0.35, 0.25]} rotation={[0.4, 0.2, 0.3]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={colors.hairHighlight} roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[-0.08, 0.38, 0.2]} rotation={[0.3, -0.1, -0.2]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={colors.hair} roughness={0.4} metalness={0.2} />
          </mesh>
          
          {/* Mechones laterales */}
          <mesh position={[-0.35, 0.1, 0.1]} rotation={[0, 0, -0.3]}>
            <capsuleGeometry args={[0.12, 0.2, 8, 16]} />
            <meshStandardMaterial color={colors.hair} roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0.35, 0.1, 0.1]} rotation={[0, 0, 0.3]}>
            <capsuleGeometry args={[0.12, 0.2, 8, 16]} />
            <meshStandardMaterial color={colors.hairHighlight} roughness={0.4} metalness={0.2} />
          </mesh>
          
          {/* Mechones traseros */}
          <mesh position={[-0.25, 0, -0.25]} rotation={[0.2, 0, 0.4]}>
            <capsuleGeometry args={[0.1, 0.18, 8, 16]} />
            <meshStandardMaterial color={colors.hair} roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0.25, 0, -0.25]} rotation={[0.2, 0, -0.4]}>
            <capsuleGeometry args={[0.1, 0.18, 8, 16]} />
            <meshStandardMaterial color={colors.hair} roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.05, -0.35]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.15, 8, 16]} />
            <meshStandardMaterial color={colors.hairHighlight} roughness={0.4} metalness={0.2} />
          </mesh>
        </group>

        {/* ==================== OJOS GRANDES EXPRESIVOS ==================== */}
        <group position={[0, 0.05, 0.25]}>
          {/* Ojo izquierdo */}
          <group position={[-0.13, 0, 0]} ref={leftEyeRef}>
            {/* Blanco del ojo */}
            <mesh>
              <sphereGeometry args={[0.1, 32, 32]} />
              <meshStandardMaterial color={colors.eyeWhite} roughness={0.1} />
            </mesh>
            {/* Iris */}
            <mesh position={[0, 0, 0.06]}>
              <sphereGeometry args={[0.06, 32, 32]} />
              <meshStandardMaterial color={colors.eyes} roughness={0.3} />
            </mesh>
            {/* Pupila */}
            <mesh position={[0, 0, 0.09]}>
              <sphereGeometry args={[0.03, 32, 32]} />
              <meshStandardMaterial color="#000000" roughness={0.2} />
            </mesh>
            {/* Brillo del ojo */}
            <mesh position={[0.02, 0.03, 0.1]}>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshStandardMaterial color={colors.eyeHighlight} emissive="#FFFFFF" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.01, -0.02, 0.1]}>
              <sphereGeometry args={[0.008, 16, 16]} />
              <meshStandardMaterial color={colors.eyeHighlight} emissive="#FFFFFF" emissiveIntensity={0.3} />
            </mesh>
          </group>

          {/* Ojo derecho */}
          <group position={[0.13, 0, 0]} ref={rightEyeRef}>
            {/* Blanco del ojo */}
            <mesh>
              <sphereGeometry args={[0.1, 32, 32]} />
              <meshStandardMaterial color={colors.eyeWhite} roughness={0.1} />
            </mesh>
            {/* Iris */}
            <mesh position={[0, 0, 0.06]}>
              <sphereGeometry args={[0.06, 32, 32]} />
              <meshStandardMaterial color={colors.eyes} roughness={0.3} />
            </mesh>
            {/* Pupila */}
            <mesh position={[0, 0, 0.09]}>
              <sphereGeometry args={[0.03, 32, 32]} />
              <meshStandardMaterial color="#000000" roughness={0.2} />
            </mesh>
            {/* Brillo del ojo */}
            <mesh position={[0.02, 0.03, 0.1]}>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshStandardMaterial color={colors.eyeHighlight} emissive="#FFFFFF" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.01, -0.02, 0.1]}>
              <sphereGeometry args={[0.008, 16, 16]} />
              <meshStandardMaterial color={colors.eyeHighlight} emissive="#FFFFFF" emissiveIntensity={0.3} />
            </mesh>
          </group>
        </group>

        {/* ==================== CEJAS ==================== */}
        <mesh ref={leftBrowRef} position={[-0.13, 0.2, 0.33]} rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.015, 0.08, 8, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={colors.brows} roughness={0.5} />
        </mesh>
        <mesh ref={rightBrowRef} position={[0.13, 0.2, 0.33]} rotation={[0, 0, -0.1]}>
          <capsuleGeometry args={[0.015, 0.08, 8, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={colors.brows} roughness={0.5} />
        </mesh>

        {/* ==================== NARIZ ==================== */}
        <mesh position={[0, -0.02, 0.38]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={colors.skinDark} roughness={0.5} />
        </mesh>

        {/* ==================== BOCA ==================== */}
        <group ref={mouthRef} position={[0, -0.15, 0.35]}>
          {/* Labios */}
          <mesh>
            <capsuleGeometry args={[0.03, mouth.width, 8, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color={colors.lips} roughness={0.3} />
          </mesh>
          {/* Sonrisa / Interior */}
          {emotion === 'feliz' || emotion === 'animando' ? (
            <mesh position={[0, -0.02, 0]}>
              <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} rotation={[0, 0, Math.PI]} />
              <meshStandardMaterial color={colors.lips} roughness={0.3} />
            </mesh>
          ) : null}
        </group>

        {/* ==================== OREJAS ==================== */}
        <mesh position={[-0.4, 0, 0]} rotation={[0, -0.3, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={colors.skin} roughness={0.5} />
        </mesh>
        <mesh position={[0.4, 0, 0]} rotation={[0, 0.3, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={colors.skin} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// Partículas decorativas flotantes
function FloatingParticles() {
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <group ref={particlesRef}>
      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh 
            position={[
              Math.sin(i * 0.8) * 1.5,
              Math.cos(i * 0.5) * 0.5 + 0.5,
              Math.cos(i * 0.8) * 1.5
            ]}
          >
            <sphereGeometry args={[0.02 + Math.random() * 0.02, 8, 8]} />
            <meshStandardMaterial 
              color="#159A9C" 
              emissive="#159A9C" 
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Escena completa del Avatar
function AvatarScene({ speaking = false, emotion = 'neutral', message = '' }) {
  return (
    <>
      {/* Fondo con gradiente */}
      <color attach="background" args={['#E8F4F8']} />
      
      {/* Iluminación profesional */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 3, -3]} intensity={0.4} color="#DEEFE7" />
      <pointLight position={[0, 2, 2]} intensity={0.6} color="#159A9C" />
      <pointLight position={[-2, 0, 1]} intensity={0.3} color="#FFE4E1" />

      {/* Avatar */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <CartoonAvatar speaking={speaking} emotion={emotion} scale={1.4} />
      </Float>

      {/* Partículas decorativas */}
      <FloatingParticles />

      {/* Mensaje del avatar */}
      {message && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-[#159A9C]/20 max-w-xs text-center animate-fadeIn">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-[#159A9C]/20" />
            <p className="text-sm text-[#002333] font-medium relative z-10">{message}</p>
          </div>
        </Html>
      )}

      {/* Sombra de contacto */}
      <ContactShadows 
        position={[0, -1.2, 0]} 
        opacity={0.5} 
        scale={4} 
        blur={2.5} 
        far={4}
        color="#002333"
      />

      {/* Controles de órbita */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 5}
        maxAzimuthAngle={Math.PI / 5}
        target={[0, 0.2, 0]}
      />

      {/* Ambiente */}
      <Environment preset="studio" />
    </>
  );
}

// Componente exportable del Avatar 3D
export default function Avatar3D({ 
  speaking = false, 
  emotion = 'neutral', 
  message = '',
  className = '',
  height = '400px'
}) {
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Canvas
        camera={{ position: [0, 0.3, 2.5], fov: 40 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <AvatarScene speaking={speaking} emotion={emotion} message={message} />
      </Canvas>
      
      {/* Indicador de estado */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <div className={`w-3 h-3 rounded-full transition-all ${speaking ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-[#B4BEC9]'}`} />
        <span className="text-sm text-[#002333] font-medium">
          {speaking ? 'AVI está hablando...' : 'Esperando...'}
        </span>
      </div>
    </div>
  );
}
