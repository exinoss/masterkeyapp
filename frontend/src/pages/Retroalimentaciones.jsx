/**
 * Página de Retroalimentaciones - Placeholder
 */
import { FileText } from 'lucide-react';

export default function Retroalimentaciones() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-[#002333]">Retroalimentaciones</h1>
        <p className="text-[#B4BEC9]">Revisa tu historial de retroalimentación</p>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-[#B4BEC9]/20 text-center">
        <FileText className="w-16 h-16 text-[#B4BEC9] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#002333] mb-2">
          Módulo de Retroalimentaciones
        </h3>
        <p className="text-[#B4BEC9] max-w-md mx-auto">
          Este módulo será implementado próximamente. Aquí podrás revisar todas las retroalimentaciones de tus sesiones de práctica.
        </p>
      </div>
    </div>
  );
}
