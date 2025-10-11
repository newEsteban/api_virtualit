import { Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user-dto';
import { UpdateUserDto } from './dtos/update-user-dto';
import { AssignRolesDto } from './dtos/assign-roles.dto';
import { 
    UserCrudService, 
    UserRolesService, 
    UserPermissionsService, 
    UserTransactionService 
} from './services';

/**
 * Servicio principal de usuarios - Patrón Orchestrator
 * 
 * Este servicio actúa como orquestador delegando responsabilidades específicas
 * a servicios especializados siguiendo el principio de Single Responsibility.
 * 
 * Arquitectura:
 * - UserCrudService: Operaciones CRUD básicas
 * - UserRolesService: Gestión de roles
 * - UserPermissionsService: Consultas de permisos
 * - UserTransactionService: Operaciones transaccionales complejas
 */
@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly userCrudService: UserCrudService,
        private readonly userRolesService: UserRolesService,
        private readonly userPermissionsService: UserPermissionsService,
        private readonly userTransactionService: UserTransactionService
    ) {}

    // =================== OPERACIONES CRUD BÁSICAS ===================

    /**
     * Obtiene todos los usuarios activos con paginación
     */
    async findAll(page?: number, limit?: number): Promise<User[]> {
        this.logger.log('Delegando consulta de usuarios a UserCrudService');
        return this.userCrudService.findAll(page, limit);
    }

    /**
     * Busca un usuario por ID
     */
    async findOne(id: string): Promise<User> {
        this.logger.log(`Delegando búsqueda de usuario ${id} a UserCrudService`);
        return this.userCrudService.findOne(id);
    }

    /**
     * Busca un usuario por email
     */
    async findByEmail(email: string): Promise<User | null> {
        this.logger.log(`Delegando búsqueda por email a UserCrudService`);
        return this.userCrudService.findByEmail(email);
    }

    /**
     * Crea un nuevo usuario
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        this.logger.log(`Creando nuevo usuario: ${createUserDto.email}`);
        
        // Si se especifican roles, usar el servicio transaccional
        if (createUserDto.rolIds && createUserDto.rolIds.length > 0) {
            return this.userTransactionService.createUserWithRoles(createUserDto, createUserDto.rolIds);
        }
        
        // Si no hay roles, crear usuario básico
        return this.userTransactionService.createUserWithRoles(createUserDto);
    }

    /**
     * Actualiza un usuario
     */
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        this.logger.log(`Actualizando usuario: ${id}`);
        
        // Si se están actualizando roles, usar el servicio transaccional
        if (updateUserDto.rolIds && updateUserDto.rolIds.length > 0) {
            const assignRolesDto: AssignRolesDto = { rolIds: updateUserDto.rolIds };
            return this.userTransactionService.updateUserRoles(id, assignRolesDto);
        }
        
        // Para otras actualizaciones, usar CRUD básico
        return this.userCrudService.update(id, updateUserDto);
    }

    /**
     * Elimina un usuario
     */
    async remove(id: string): Promise<{ message: string }> {
        this.logger.log(`Eliminando usuario: ${id}`);
        const success = await this.userTransactionService.deleteUserWithRelations(id);
        
        if (success) {
            return { message: 'Usuario eliminado correctamente' };
        } else {
            throw new Error('Error al eliminar usuario');
        }
    }

    /**
     * Asigna roles a un usuario
     */
    async assignRoles(userId: string, assignRolesDto: AssignRolesDto): Promise<User> {
        this.logger.log(`Asignando roles al usuario: ${userId}`);
        return this.userTransactionService.updateUserRoles(userId, assignRolesDto);
    }

    /**
     * Remueve roles específicos de un usuario
     */
    async removeRoles(userId: string, rolesIds: number[]): Promise<User> {
        this.logger.log(`Removiendo roles del usuario: ${userId}`);
        return this.userRolesService.removeRoles(userId, rolesIds);
    }

    /**
     * Obtiene todos los permisos de un usuario
     */
    async getUserPermissions(userId: string): Promise<string[]> {
        this.logger.log(`Obteniendo permisos del usuario: ${userId}`);
        return this.userPermissionsService.getUserPermissions(userId);
    }

    /**
     * Verifica si un usuario tiene un permiso específico
     */
    async hasPermission(userId: string, permission: string): Promise<boolean> {
        this.logger.log(`Verificando permiso '${permission}' para usuario: ${userId}`);
        return this.userPermissionsService.hasPermission(userId, permission);
    }
}
