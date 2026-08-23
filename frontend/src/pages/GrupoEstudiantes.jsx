/**
 * Página de Administrar Grupo Estudiantes - Placeholder (Solo Docentes/Admin)
 */
import { Users, Plus } from 'lucide-react';

export default function GrupoEstudiantes() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002333]">Administrar Grupo</h1>
          <p className="text-[#B4BEC9]">Gestiona tu grupo de estudiantes</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#159A9C] text-white rounded-xl font-medium hover:bg-[#002333] transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          Agregar Estudiante
        </button>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-[#B4BEC9]/20 text-center">
        <Users className="w-16 h-16 text-[#B4BEC9] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#002333] mb-2">
          Módulo de Administración de Grupo
        </h3>
        <p className="text-[#B4BEC9] max-w-md mx-auto">
          Este módulo será implementado próximamente. Aquí podrás asignar y gestionar estudiantes en tu grupo.
        </p>
      </div>
    </div>
  );
}
