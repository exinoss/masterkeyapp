"""
Admin para la app Users.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario, Estudiante, Docente, Administrador, AsignacionDocenteEstudiante


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """Admin personalizado para el modelo Usuario."""
    list_display = ['email', 'username', 'nombre', 'apellido', 'tipo_usuario', 'is_active', 'created_at']
    list_filter = ['tipo_usuario', 'is_active', 'is_verified', 'is_staff']
    search_fields = ['email', 'username', 'nombre', 'apellido']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('username', 'nombre', 'apellido', 'avatar_url')}),
        ('Tipo de Usuario', {'fields': ('tipo_usuario',)}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')}),
        ('Fechas', {'fields': ('last_login',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'nombre', 'apellido', 'tipo_usuario', 'password1', 'password2'),
        }),
    )


@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    """Admin para el modelo Estudiante."""
    list_display = ['usuario', 'nivel_ingles', 'horas_practica', 'puntuacion_promedio', 'sesiones_completadas']
    list_filter = ['nivel_ingles']
    search_fields = ['usuario__email', 'usuario__nombre', 'usuario__apellido']
    raw_id_fields = ['usuario']


@admin.register(Docente)
class DocenteAdmin(admin.ModelAdmin):
    """Admin para el modelo Docente."""
    list_display = ['usuario', 'especialidad', 'años_experiencia']
    search_fields = ['usuario__email', 'usuario__nombre', 'usuario__apellido', 'especialidad']
    raw_id_fields = ['usuario']


@admin.register(Administrador)
class AdministradorAdmin(admin.ModelAdmin):
    """Admin para el modelo Administrador."""
    list_display = ['usuario', 'nivel_acceso', 'departamento']
    list_filter = ['nivel_acceso']
    search_fields = ['usuario__email', 'usuario__nombre', 'usuario__apellido']
    raw_id_fields = ['usuario']


@admin.register(AsignacionDocenteEstudiante)
class AsignacionDocenteEstudianteAdmin(admin.ModelAdmin):
    """Admin para asignaciones docente-estudiante."""
    list_display = ['docente', 'estudiante', 'fecha_asignacion', 'activo']
    list_filter = ['activo', 'fecha_asignacion']
    raw_id_fields = ['docente', 'estudiante']
