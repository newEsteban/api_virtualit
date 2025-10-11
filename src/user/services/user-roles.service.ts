import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Rol } from '../../rol/entities/rol.entity';
import { AssignRolesDto } from '../dtos/assign-roles.dto';

/**
 * Servicio para gestión de roles de usuarios
 * 
 * Centraliza toda la lógica relacionada con asignación, remoción
 * y consulta de roles de usuarios.
 */
@Injectable()
export class UserRolesService {
    private readonly logger = new Logger(UserRolesService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>
    ) {}

    /**
     * Obtiene todos los roles de un usuario
     * 
     * @param userId - ID del usuario
     * @returns Array de roles del usuario
     */
    async getUserRoles(userId: string): Promise<Rol[]> {
        this.logger.log(`Obteniendo roles para usuario: ${userId}`);
        
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user) {
            throw new NotFoundException(`Usuario no encontrado: ${userId}`);
        }

        this.logger.log(`Usuario ${userId} tiene ${user.roles.length} roles asignados`);
        return user.roles;
    }

    /**
     * Asigna roles a un usuario
     * 
     * @param userId - ID del usuario
     * @param assignRolesDto - DTOs con los IDs de roles a asignar
     * @returns Usuario actualizado con sus nuevos roles
     */
    async assignRoles(userId: string, assignRolesDto: AssignRolesDto): Promise<User> {
        this.logger.log(`Asignando roles al usuario: ${userId}`);
        this.logger.debug(`Roles a asignar:`, assignRolesDto.rolIds);

        // Validar que hay roles para asignar
        if (!assignRolesDto.rolIds || assignRolesDto.rolIds.length === 0) {
            throw new BadRequestException('Debe proporcionar al menos un rol para asignar');
        }

        // Obtener usuario con sus roles actuales
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user) {
            throw new NotFoundException(`Usuario no encontrado: ${userId}`);
        }

        // Verificar que todos los roles existen
        const roles = await this.rolRepository.find({
            where: { id: In(assignRolesDto.rolIds) }
        });

        if (roles.length !== assignRolesDto.rolIds.length) {
            const foundIds = roles.map(rol => rol.id);
            const missingIds = assignRolesDto.rolIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Roles no encontrados: ${missingIds.join(', ')}`);
        }

        // Asignar nuevos roles (reemplaza los existentes)
        user.roles = roles;
        const updatedUser = await this.userRepository.save(user);

        this.logger.log(`Roles asignados exitosamente al usuario: ${userId}`);
        this.logger.debug(`Nuevos roles:`, roles.map(r => `${r.id}: ${r.name}`));

        return updatedUser;
    }

    /**
     * Agrega roles adicionales a un usuario (sin reemplazar los existentes)
     * 
     * @param userId - ID del usuario
     * @param rolesIds - IDs de roles a agregar
     * @returns Usuario actualizado
     */
    async addRoles(userId: string, rolesIds: number[]): Promise<User> {
        this.logger.log(`Agregando roles adicionales al usuario: ${userId}`);
        
        if (!rolesIds || rolesIds.length === 0) {
            throw new BadRequestException('Debe proporcionar al menos un rol para agregar');
        }

        // Obtener usuario con sus roles actuales
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user) {
            throw new NotFoundException(`Usuario no encontrado: ${userId}`);
        }

        // Verificar que los nuevos roles existen
        const newRoles = await this.rolRepository.find({
            where: { id: In(rolesIds) }
        });

        if (newRoles.length !== rolesIds.length) {
            const foundIds = newRoles.map(rol => rol.id);
            const missingIds = rolesIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Roles no encontrados: ${missingIds.join(', ')}`);
        }

        // Filtrar roles que el usuario ya no tiene
        const currentRoleIds = user.roles.map(role => role.id);
        const rolesToAdd = newRoles.filter(role => !currentRoleIds.includes(role.id));

        if (rolesToAdd.length === 0) {
            this.logger.log(`Usuario ${userId} ya tiene todos los roles especificados`);
            return user;
        }

        // Agregar nuevos roles a los existentes
        user.roles = [...user.roles, ...rolesToAdd];
        const updatedUser = await this.userRepository.save(user);

        this.logger.log(`${rolesToAdd.length} roles agregados al usuario: ${userId}`);
        this.logger.debug(`Roles agregados:`, rolesToAdd.map(r => `${r.id}: ${r.name}`));

        return updatedUser;
    }

    /**
     * Remueve roles específicos de un usuario
     * 
     * @param userId - ID del usuario
     * @param rolesIds - IDs de roles a remover
     * @returns Usuario actualizado
     */
    async removeRoles(userId: string, rolesIds: number[]): Promise<User> {
        this.logger.log(`Removiendo roles del usuario: ${userId}`);
        
        if (!rolesIds || rolesIds.length === 0) {
            throw new BadRequestException('Debe proporcionar al menos un rol para remover');
        }

        // Obtener usuario con sus roles actuales
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user) {
            throw new NotFoundException(`Usuario no encontrado: ${userId}`);
        }

        // Filtrar roles que se mantendrán
        const rolesToKeep = user.roles.filter(role => !rolesIds.includes(role.id));
        const removedCount = user.roles.length - rolesToKeep.length;

        if (removedCount === 0) {
            this.logger.log(`Usuario ${userId} no tenía ninguno de los roles especificados para remover`);
            return user;
        }

        // Actualizar roles del usuario
        user.roles = rolesToKeep;
        const updatedUser = await this.userRepository.save(user);

        this.logger.log(`${removedCount} roles removidos del usuario: ${userId}`);
        this.logger.debug(`Roles restantes: ${rolesToKeep.length}`);

        return updatedUser;
    }

    /**
     * Remueve todos los roles de un usuario
     * 
     * @param userId - ID del usuario
     * @returns Usuario actualizado sin roles
     */
    async removeAllRoles(userId: string): Promise<User> {
        this.logger.log(`Removiendo todos los roles del usuario: ${userId}`);
        
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user) {
            throw new NotFoundException(`Usuario no encontrado: ${userId}`);
        }

        const rolesCount = user.roles.length;
        user.roles = [];
        const updatedUser = await this.userRepository.save(user);

        this.logger.log(`${rolesCount} roles removidos del usuario: ${userId}`);
        return updatedUser;
    }

    /**
     * Verifica si un usuario tiene un rol específico
     * 
     * @param userId - ID del usuario
     * @param roleId - ID del rol a verificar
     * @returns true si el usuario tiene el rol
     */
    async hasRole(userId: string, roleId: number): Promise<boolean> {
        this.logger.log(`Verificando si usuario ${userId} tiene rol ${roleId}`);
        
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user) {
            return false;
        }

        const hasRole = user.roles.some(role => role.id === roleId);
        this.logger.log(`Usuario ${userId} ${hasRole ? 'TIENE' : 'NO TIENE'} rol ${roleId}`);
        
        return hasRole;
    }

    /**
     * Verifica si un usuario tiene alguno de los roles especificados
     * 
     * @param userId - ID del usuario
     * @param rolesIds - IDs de roles a verificar
     * @returns true si el usuario tiene al menos uno de los roles
     */
    async hasAnyRole(userId: string, rolesIds: number[]): Promise<boolean> {
        this.logger.log(`Verificando si usuario ${userId} tiene alguno de estos roles: [${rolesIds.join(', ')}]`);
        
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user || rolesIds.length === 0) {
            return false;
        }

        const userRoleIds = user.roles.map(role => role.id);
        const hasAnyRole = rolesIds.some(roleId => userRoleIds.includes(roleId));
        
        this.logger.log(`Usuario ${userId} ${hasAnyRole ? 'TIENE' : 'NO TIENE'} alguno de los roles especificados`);
        return hasAnyRole;
    }

    /**
     * Verifica si un usuario tiene todos los roles especificados
     * 
     * @param userId - ID del usuario
     * @param rolesIds - IDs de roles a verificar
     * @returns true si el usuario tiene todos los roles
     */
    async hasAllRoles(userId: string, rolesIds: number[]): Promise<boolean> {
        this.logger.log(`Verificando si usuario ${userId} tiene TODOS estos roles: [${rolesIds.join(', ')}]`);
        
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user || rolesIds.length === 0) {
            return false;
        }

        const userRoleIds = user.roles.map(role => role.id);
        const hasAllRoles = rolesIds.every(roleId => userRoleIds.includes(roleId));
        
        this.logger.log(`Usuario ${userId} ${hasAllRoles ? 'TIENE' : 'NO TIENE'} todos los roles especificados`);
        return hasAllRoles;
    }

    // =================== MÉTODOS PARA TRANSACCIONES ===================

    /**
     * Asigna roles a un usuario dentro de una transacción
     * 
     * @param user - Entidad del usuario
     * @param rolesIds - IDs de roles a asignar
     * @param queryRunner - QueryRunner de la transacción
     */
    async assignRolesToUserTransaction(user: User, rolesIds: number[], queryRunner: QueryRunner): Promise<void> {
        this.logger.log(`[TRANSACCIÓN] Asignando roles al usuario: ${user.id}`);
        
        // Verificar que todos los roles existen
        const roles = await queryRunner.manager.find(Rol, {
            where: { id: In(rolesIds) }
        });

        if (roles.length !== rolesIds.length) {
            const foundIds = roles.map(rol => rol.id);
            const missingIds = rolesIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Roles no encontrados: ${missingIds.join(', ')}`);
        }

        // Asignar roles
        user.roles = roles;
        await queryRunner.manager.save(User, user);
        
        this.logger.log(`[TRANSACCIÓN] Roles asignados exitosamente al usuario: ${user.id}`);
    }

    /**
     * Remueve todos los roles de un usuario dentro de una transacción
     * 
     * @param user - Entidad del usuario
     * @param queryRunner - QueryRunner de la transacción
     */
    async removeAllRolesFromUserTransaction(user: User, queryRunner: QueryRunner): Promise<void> {
        this.logger.log(`[TRANSACCIÓN] Removiendo todos los roles del usuario: ${user.id}`);
        
        user.roles = [];
        await queryRunner.manager.save(User, user);
        
        this.logger.log(`[TRANSACCIÓN] Roles removidos del usuario: ${user.id}`);
    }

    /**
     * Obtiene estadísticas de roles de un usuario
     * 
     * @param userId - ID del usuario
     * @returns Objeto con estadísticas de roles
     */
    async getRoleStats(userId: string): Promise<{
        totalRoles: number;
        rolesList: Array<{ id: number; name: string; description?: string }>;
        isAdmin: boolean;
    }> {
        this.logger.log(`Obteniendo estadísticas de roles para usuario: ${userId}`);
        
        const roles = await this.getUserRoles(userId);
        const isAdmin = roles.some(role => role.name.toLowerCase().includes('admin'));

        const stats = {
            totalRoles: roles.length,
            rolesList: roles.map(role => ({
                id: role.id,
                name: role.name,
                description: role.description
            })),
            isAdmin
        };

        this.logger.log(`Usuario ${userId} tiene ${stats.totalRoles} roles, admin: ${stats.isAdmin}`);
        return stats;
    }
}
