/**
 * Página de Reportes - Placeholder (Solo Docentes/Admin)
 */
import { BarChart3 } from 'lucide-react';

export default function Reportes() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-[#002333]">Reporte Estudiantes</h1>
        <p className="text-[#B4BEC9]">Visualiza el progreso de tus estudiantes</p>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-[#B4BEC9]/20 text-center">
        <BarChart3 className="w-16 h-16 text-[#B4BEC9] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#002333] mb-2">
          Módulo de Reportes
        </h3>
        <p className="text-[#B4BEC9] max-w-md mx-auto">
          Este módulo será implementado próximamente. Aquí podrás ver reportes detallados del progreso de todos tus estudiantes asignados.
        </p>
      </div>
    </div>
  );
}
