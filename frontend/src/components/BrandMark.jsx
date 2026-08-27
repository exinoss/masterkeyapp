/**
 * BrandMark — el logo de MasterKey: una llave con un birrete encima.
 *
 * Es el PNG que aportó el usuario (`assets/logobase.png`), no un ícono
 * de lucide ni un SVG a mano. `logobase-blanco.png` es una variante
 * generada a partir de ese mismo archivo: mismo canal alfa, recoloreado
 * a blanco sólido (antes el birrete era azul y la llave casi invisible
 * sobre blanco — pensado para fondo claro, no para los badges azules
 * donde se usa la marca hoy). Si en algún momento se necesita la marca
 * sobre un fondo claro, usar `logobase.png` (colores originales) en vez
 * de este componente.
 *
 * Se usa igual que antes: <BrandMark className="w-5 h-5" />
 */
import logoBlanco from '../assets/logobase-blanco.png';

export default function BrandMark({ className = 'w-6 h-6' }) {
  return <img src={logoBlanco} alt="" className={className} />;
}
