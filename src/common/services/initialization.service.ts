import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PermisoService } from '../../permiso/permiso.service';
import { RolService } from '../../rol/rol.service';
import { UserService } from '../../user/user.service';

/**
 * Servicio de inicialización del sistema de permisos
 * 
 * Se encarga de crear los permisos y roles básicos del sistema
 * cuando la aplicación se inicia por primera vez.
 */
@Injectable()
export class InitializationService implements OnModuleInit {
  private readonly logger = new Logger(InitializationService.name);

  constructor(
    private readonly permisoService: PermisoService,
    private readonly rolService: RolService,
    private readonly userService: UserService,
  ) {}

  /**
   * Se ejecuta cuando el módulo se inicializa
   */
  async onModuleInit() {
    try {
      await this.createDefaultPermissions();
      await this.createDefaultRoles();
      this.logger.log('Sistema de permisos inicializado correctamente');
    } catch (error) {
      this.logger.error('Error inicializando sistema de permisos:', error);
    }
  }

  /**
   * Crea los permisos por defecto del sistema
   */
  private async createDefaultPermissions() {
    const defaultPermissions = [
      // Permisos de usuarios
      { name: 'user:read', description: 'Leer usuarios', resource: 'user', action: 'read' },
      { name: 'user:create', description: 'Crear usuarios', resource: 'user', action: 'create' },
      { name: 'user:update', description: 'Actualizar usuarios', resource: 'user', action: 'update' },
      { name: 'user:delete', description: 'Eliminar usuarios', resource: 'user', action: 'delete' },
      { name: 'user:assign-roles', description: 'Gestionar roles de usuarios', resource: 'user', action: 'assign-roles' },

      // Permisos de roles
      { name: 'rol:read', description: 'Leer roles', resource: 'rol', action: 'read' },
      { name: 'rol:create', description: 'Crear roles', resource: 'rol', action: 'create' },
      { name: 'rol:update', description: 'Actualizar roles', resource: 'rol', action: 'update' },
      { name: 'rol:delete', description: 'Eliminar roles', resource: 'rol', action: 'delete' },
      { name: 'rol:assign-permissions', description: 'Gestionar permisos de roles', resource: 'rol', action: 'assign-permissions' },

      // Permisos de permisos
      { name: 'permiso:read', description: 'Leer permisos', resource: 'permiso', action: 'read' },
      { name: 'permiso:create', description: 'Crear permisos', resource: 'permiso', action: 'create' },
      { name: 'permiso:update', description: 'Actualizar permisos', resource: 'permiso', action: 'update' },
      { name: 'permiso:delete', description: 'Eliminar permisos', resource: 'permiso', action: 'delete' },

      // Permisos del dashboard
      { name: 'dashboard:access', description: 'Acceder al dashboard', resource: 'dashboard', action: 'access' },
      { name: 'dashboard:analytics', description: 'Ver analíticas', resource: 'dashboard', action: 'analytics' },

      // Permisos de configuración
      { name: 'settings:read', description: 'Leer configuración', resource: 'settings', action: 'read' },
      { name: 'settings:update', description: 'Actualizar configuración', resource: 'settings', action: 'update' },
    ];

    for (const permission of defaultPermissions) {
      try {
        await this.permisoService.create(permission);
        this.logger.log(`Permiso creado: ${permission.name}`);
      } catch (error) {
        // Si el permiso ya existe, lo ignoramos
        if (error.message?.includes('Ya existe un permiso')) {
          this.logger.debug(`Permiso ya existe: ${permission.name}`);
        } else {
          this.logger.error(`Error creando permiso ${permission.name}:`, error.message);
        }
      }
    }
  }

  /**
   * Crea los roles por defecto del sistema
   */
  private async createDefaultRoles() {
    const defaultRoles = [
      {
        name: 'super_admin',
        description: 'Super Administrador - Acceso total al sistema',
        priority: 1,
        isSystem: true,
        permissions: [
          'user:read', 'user:create', 'user:update', 'user:delete', 'user:assign-roles',
          'rol:read', 'rol:create', 'rol:update', 'rol:delete', 'rol:assign-permissions',
          'permiso:read', 'permiso:create', 'permiso:update', 'permiso:delete',
          'dashboard:access', 'dashboard:analytics',
          'settings:read', 'settings:update'
        ]
      },
      {
        name: 'admin',
        description: 'Administrador - Gestión de usuarios y contenido',
        priority: 10,
        permissions: [
          'user:read', 'user:create', 'user:update', 'user:assign-roles',
          'rol:read',
          'dashboard:access', 'dashboard:analytics',
          'settings:read'
        ]
      },
      {
        name: 'editor',
        description: 'Editor - Gestión de contenido',
        priority: 50,
        permissions: [
          'user:read',
          'dashboard:access'
        ]
      },
      {
        name: 'viewer',
        description: 'Visualizador - Solo lectura',
        priority: 100,
        permissions: [
          'dashboard:access'
        ]
      }
    ];

    for (const role of defaultRoles) {
      try {
        // Buscar permisos por nombre
        const allPermissions = await this.permisoService.findAll();
        const rolePermissions = allPermissions.filter(p => 
          role.permissions.includes(p.name)
        );

        // Crear rol con permisos
        const createdRole = await this.rolService.create({
          name: role.name,
          description: role.description,
          priority: role.priority,
          permisoIds: rolePermissions.map(p => p.id)
        });

        // Si es un rol del sistema, marcarlo como tal
        if (role.isSystem) {
          await this.rolService.update(createdRole.id, { isSystem: true });
        }

        this.logger.log(`Rol creado: ${role.name} con ${rolePermissions.length} permisos`);
      } catch (error) {
        if (error.message?.includes('Ya existe un rol')) {
          this.logger.debug(`Rol ya existe: ${role.name}`);
        } else {
          this.logger.error(`Error creando rol ${role.name}:`, error.message);
        }
      }
    }
  }
}
