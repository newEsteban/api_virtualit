import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

/**
 * Servicio para gestión de permisos de usuarios
 * 
 * Centraliza toda la lógica relacionada con consultas y verificaciones
 * de permisos de usuarios a través de sus roles asignados.
 */
@Injectable()
export class UserPermissionsService {
    private readonly logger = new Logger(UserPermissionsService.name);

    constructor(
        private readonly userRepository: UserRepository
    ) {}

    /**
     * Obtiene todos los permisos únicos de un usuario a través de sus roles
     * 
     * @param userId - ID del usuario
     * @returns Array único de nombres de permisos del usuario
     */
    async getUserPermissions(userId: string): Promise<string[]> {
        this.logger.log(`Obteniendo permisos para usuario: ${userId}`);
        
        const permissions = await this.userRepository.getUserPermissions(userId);
        
        this.logger.log(`Usuario ${userId} tiene ${permissions.length} permisos únicos`);
        this.logger.debug(`Permisos del usuario ${userId}:`, permissions);
        
        return permissions;
    }

    /**
     * Verifica si un usuario tiene un permiso específico
     * 
     * @param userId - ID del usuario
     * @param permission - Nombre del permiso a verificar
     * @returns true si el usuario tiene el permiso, false si no
     */
    async hasPermission(userId: string, permission: string): Promise<boolean> {
        this.logger.log(`Verificando permiso '${permission}' para usuario: ${userId}`);
        
        const hasPermission = await this.userRepository.hasPermission(userId, permission);
        
        this.logger.log(`Usuario ${userId} ${hasPermission ? 'TIENE' : 'NO TIENE'} permiso '${permission}'`);
        return hasPermission;
    }

    /**
     * Verifica si un usuario tiene alguno de los permisos especificados
     * 
     * @param userId - ID del usuario
     * @param permissions - Array de nombres de permisos a verificar
     * @returns true si el usuario tiene al menos uno de los permisos
     */
    async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
        this.logger.log(`Verificando si usuario ${userId} tiene alguno de estos permisos: [${permissions.join(', ')}]`);
        
        if (permissions.length === 0) {
            this.logger.warn(`Array de permisos vacío para usuario ${userId}`);
            return false;
        }

        for (const permission of permissions) {
            const hasPermission = await this.userRepository.hasPermission(userId, permission);
            if (hasPermission) {
                this.logger.log(`Usuario ${userId} TIENE permiso '${permission}' (verificación ANY exitosa)`);
                return true;
            }
        }

        this.logger.log(`Usuario ${userId} NO TIENE ninguno de los permisos especificados`);
        return false;
    }

    /**
     * Verifica si un usuario tiene todos los permisos especificados
     * 
     * @param userId - ID del usuario
     * @param permissions - Array de nombres de permisos a verificar
     * @returns true si el usuario tiene todos los permisos
     */
    async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
        this.logger.log(`Verificando si usuario ${userId} tiene TODOS estos permisos: [${permissions.join(', ')}]`);
        
        if (permissions.length === 0) {
            this.logger.warn(`Array de permisos vacío para usuario ${userId}`);
            return true;
        }

        for (const permission of permissions) {
            const hasPermission = await this.userRepository.hasPermission(userId, permission);
            if (!hasPermission) {
                this.logger.log(`Usuario ${userId} NO TIENE permiso '${permission}' (verificación ALL falló)`);
                return false;
            }
        }

        this.logger.log(`Usuario ${userId} TIENE todos los permisos especificados`);
        return true;
    }

    /**
     * Obtiene información detallada de permisos por recurso
     * 
     * @param userId - ID del usuario
     * @returns Objeto con permisos agrupados por recurso
     */
    async getPermissionsByResource(userId: string): Promise<Record<string, string[]>> {
        this.logger.log(`Obteniendo permisos agrupados por recurso para usuario: ${userId}`);
        
        const permissions = await this.getUserPermissions(userId);
        const permissionsByResource: Record<string, string[]> = {};

        permissions.forEach(permission => {
            // Asumir formato "resource:action"
            const parts = permission.split(':');
            if (parts.length === 2) {
                const [resource, action] = parts;
                if (!permissionsByResource[resource]) {
                    permissionsByResource[resource] = [];
                }
                permissionsByResource[resource].push(action);
            } else {
                // Para permisos que no siguen el formato resource:action
                if (!permissionsByResource['other']) {
                    permissionsByResource['other'] = [];
                }
                permissionsByResource['other'].push(permission);
            }
        });

        this.logger.log(`Usuario ${userId} tiene permisos en ${Object.keys(permissionsByResource).length} recursos`);
        this.logger.debug(`Permisos por recurso para usuario ${userId}:`, permissionsByResource);
        
        return permissionsByResource;
    }

    /**
     * Verifica si un usuario puede realizar una acción específica en un recurso
     * 
     * @param userId - ID del usuario
     * @param resource - Nombre del recurso
     * @param action - Acción a verificar
     * @returns true si el usuario puede realizar la acción
     */
    async canPerformAction(userId: string, resource: string, action: string): Promise<boolean> {
        const permission = `${resource}:${action}`;
        this.logger.log(`Verificando si usuario ${userId} puede realizar '${action}' en '${resource}'`);
        
        return this.hasPermission(userId, permission);
    }

    /**
     * Obtiene estadísticas de permisos de un usuario
     * 
     * @param userId - ID del usuario
     * @returns Objeto con estadísticas de permisos
     */
    async getPermissionStats(userId: string): Promise<{
        totalPermissions: number;
        resourcesCount: number;
        resources: string[];
        permissionsList: string[];
    }> {
        this.logger.log(`Obteniendo estadísticas de permisos para usuario: ${userId}`);
        
        const permissions = await this.getUserPermissions(userId);
        const permissionsByResource = await this.getPermissionsByResource(userId);
        const resources = Object.keys(permissionsByResource);

        const stats = {
            totalPermissions: permissions.length,
            resourcesCount: resources.length,
            resources: resources,
            permissionsList: permissions
        };

        this.logger.log(`Estadísticas de usuario ${userId}: ${stats.totalPermissions} permisos en ${stats.resourcesCount} recursos`);
        return stats;
    }
}
