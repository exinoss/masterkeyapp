/**
 * Avatar del tutor virtual — MasterKey
 *
 * Renderiza la mascota de `assets/avatar-rive/avatar-tutor.riv` con el
 * runtime de Rive, artboard "O11Y-Interactive".
 *
 * POR QUÉ ESTE ARTBOARD: el archivo trae 5. Solo este y "O11Y-Homepage"
 * están limpios (sin fondo ni texto horneados) — se probó primero
 * "O11Y-Expression" por su burbuja de diálogo, pero esa burbuja es de
 * tamaño fijo (no cabe una frase real de sesión) y viene pegada a un
 * fondo crema permanente que no se puede quitar por código (ninguna
 * forma tiene nombre propio en el archivo). Se descartó.
 *
 * "O11Y-Interactive" no tiene expresiones faciales por emoción (no hay
 * "Sad"/"Angry"/"Excited" en este artboard — esas solo existen en
 * "O11Y-Expression", el que se descartó). Lo que sí tiene es un set de
 * íconos dibujados dentro de la cara: ✗ (Cross), ✓ (Check), corazón
 * (Heart), cara contenta (Happy). El mapeo de abajo usa esos íconos como
 * señal de resultado, no como expresión — es lo que el archivo permite.
 * No hay ningún ícono que lea como "enojado"; se reutiliza Cross.
 *
 * POR QUÉ `reset()` Y NO `play()`/`stop()`: en el artboard anterior se
 * comprobó que un simple stop/play no repite el keyframe de entrada de
 * una animación ya reproducida antes. `reset()` reinstancia el artboard
 * en cada cambio de gesto, evitando ese tipo de bug aunque acá no se haya
 * confirmado que ocurra — es la vía ya probada como segura.
 *
 * Este artboard no tiene textos (TextValueRun) horneados, así que no
 * hace falta blanquear nada — el único texto que se muestra es el
 * mensaje real de la sesión, en la burbuja HTML de abajo.
 */
import { useEffect } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import mascotaRiv from '../assets/avatar-rive/avatar-tutor.riv';

const ARTBOARD = 'O11Y-Interactive';
const BLINK = 'Blink';

// El dibujo no está centrado del todo dentro de su artboard: midiendo los
// píxeles opacos del fotograma en reposo, ocupa X 126–373 (centrado exacto)
// pero Y 104–375, cuyo centro queda ~10px por encima del centro de los 500
// del artboard. Se compensa bajando ese 2%.
const AJUSTE_VERTICAL = 'translateY(2%)';

const IDLE = 'Idle-01';
const IDLE_ACTIVO = 'Idle-02';

// Gesto según el resultado real de la sesión (ver Sesiones.jsx: puntuación
// del intento y, más adelante, moderación de contenido para "enojado").
const GESTO_EMOCION = {
  feliz: 'Happy',
  superFeliz: 'Heart',
  triste: 'Cross',
  enojado: 'Cross', // no hay ícono de enojo en este artboard; se reutiliza
  neutral: IDLE_ACTIVO
};

export default function Avatar({
  speaking = false,
  emotion = 'neutral',
  message = '',
  className = '',
  height = '400px'
}) {
  const { rive, RiveComponent } = useRive({
    src: mascotaRiv,
    artboard: ARTBOARD,
    animations: [IDLE, BLINK],
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center })
  });

  useEffect(() => {
    if (!rive) return;
    const gesto = speaking ? GESTO_EMOCION[emotion] || IDLE_ACTIVO : IDLE;
    rive.reset({ artboard: ARTBOARD, animations: [gesto, BLINK], autoplay: true });
  }, [rive, speaking, emotion]);

  return (
    <div
      className={`relative w-full flex items-center justify-center bg-mk-surface ${className}`}
      style={{ height }}
    >
      {message && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-fadeIn max-w-xs px-4">
          <div className="bg-mk-surface border border-mk-line rounded-lg px-4 py-2.5 text-center shadow-sm">
            <p className="text-sm text-mk-ink font-medium">{message}</p>
          </div>
        </div>
      )}

      <div
        className="h-full max-w-full aspect-square"
        style={{ transform: AJUSTE_VERTICAL }}
      >
        <RiveComponent className="w-full h-full" />
      </div>
    </div>
  );
}
