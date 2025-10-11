import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user-dto';
import { AssignRolesDto } from '../dtos/assign-roles.dto';
import { UserCrudService } from './user-crud.service';
import { UserRolesService } from './user-roles.service';

/**
 * Servicio para gestión de transacciones de usuarios
 * 
 * Centraliza todas las operaciones que requieren transacciones de base de datos
 * garantizando consistencia e integridad en operaciones complejas.
 */
@Injectable()
export class UserTransactionService {
    private readonly logger = new Logger(UserTransactionService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly userCrudService: UserCrudService,
        private readonly userRolesService: UserRolesService
    ) {}

    /**
     * Crea un nuevo usuario con roles asignados en una transacción
     * 
     * @param createUserDto - Datos del usuario a crear
     * @param rolesIds - IDs de roles a asignar (opcional)
     * @returns Usuario creado con sus roles
     */
    async createUserWithRoles(createUserDto: CreateUserDto, rolesIds?: number[]): Promise<User> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        this.logger.log(`Iniciando transacción para crear usuario: ${createUserDto.email}`);

        try {
            // 1. Crear el usuario base
            this.logger.log(`Creando usuario base: ${createUserDto.email}`);
            const newUser = await this.userCrudService.createUserBase(createUserDto, queryRunner);

            // 2. Asignar roles si se proporcionaron
            if (rolesIds && rolesIds.length > 0) {
                this.logger.log(`Asignando ${rolesIds.length} roles al usuario: ${newUser.id}`);
                await this.userRolesService.assignRolesToUserTransaction(newUser, rolesIds, queryRunner);
            }

            // 3. Confirmar transacción
            await queryRunner.commitTransaction();
            this.logger.log(`Usuario creado exitosamente: ${newUser.id} - ${newUser.email}`);

            // 4. Retornar usuario con relaciones cargadas
            const userWithRelations = await this.userCrudService.findByIdWithRelations(newUser.id);
            if (!userWithRelations) {
                throw new InternalServerErrorException('Error al cargar usuario creado');
            }
            return userWithRelations;

        } catch (error) {
            // Rollback en caso de error
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Error al crear usuario con roles');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Actualiza roles de un usuario existente en una transacción
     * 
     * @param userId - ID del usuario
     * @param assignRolesDto - Nuevos roles a asignar
     * @returns Usuario actualizado con sus nuevos roles
     */
    async updateUserRoles(userId: string, assignRolesDto: AssignRolesDto): Promise<User> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        this.logger.log(`Iniciando transacción para actualizar roles del usuario: ${userId}`);

        try {
            // 1. Verificar que el usuario existe
            const user = await this.userCrudService.findById(userId);
            if (!user) {
                throw new Error(`Usuario no encontrado: ${userId}`);
            }

            // 2. Obtener roles actuales
            const currentRoles = await this.userRolesService.getUserRoles(userId);
            this.logger.log(`Usuario ${userId} tiene ${currentRoles.length} roles actuales`);

            // 3. Remover todos los roles actuales
            if (currentRoles.length > 0) {
                this.logger.log(`Removiendo ${currentRoles.length} roles actuales`);
                await this.userRolesService.removeAllRolesFromUserTransaction(user, queryRunner);
            }

            // 4. Asignar nuevos roles
            if (assignRolesDto.rolIds.length > 0) {
                this.logger.log(`Asignando ${assignRolesDto.rolIds.length} nuevos roles`);
                await this.userRolesService.assignRolesToUserTransaction(user, assignRolesDto.rolIds, queryRunner);
            }

            // 5. Confirmar transacción
            await queryRunner.commitTransaction();
            this.logger.log(`Roles actualizados exitosamente para usuario: ${userId}`);

            // 6. Retornar usuario con relaciones actualizadas
            const updatedUser = await this.userCrudService.findByIdWithRelations(userId);
            if (!updatedUser) {
                throw new InternalServerErrorException('Error al cargar usuario actualizado');
            }
            return updatedUser;

        } catch (error) {
            // Rollback en caso de error
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error al actualizar roles del usuario ${userId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Error al actualizar roles del usuario');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Elimina un usuario y todas sus relaciones en una transacción
     * 
     * @param userId - ID del usuario a eliminar
     * @returns true si se eliminó correctamente
     */
    async deleteUserWithRelations(userId: string): Promise<boolean> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        this.logger.log(`Iniciando transacción para eliminar usuario: ${userId}`);

        try {
            // 1. Verificar que el usuario existe
            const user = await this.userCrudService.findById(userId);
            if (!user) {
                throw new Error(`Usuario no encontrado: ${userId}`);
            }

            // 2. Obtener información de roles antes de eliminar
            const currentRoles = await this.userRolesService.getUserRoles(userId);
            this.logger.log(`Usuario ${userId} tiene ${currentRoles.length} roles que serán removidos`);

            // 3. Remover todas las relaciones de roles
            if (currentRoles.length > 0) {
                await this.userRolesService.removeAllRolesFromUserTransaction(user, queryRunner);
                this.logger.log(`Relaciones de roles removidas para usuario: ${userId}`);
            }

            // 4. Eliminar el usuario
            await this.userCrudService.deleteUserTransaction(userId, queryRunner);
            this.logger.log(`Usuario eliminado: ${userId}`);

            // 5. Confirmar transacción
            await queryRunner.commitTransaction();
            this.logger.log(`Usuario eliminado exitosamente: ${userId}`);

            return true;

        } catch (error) {
            // Rollback en caso de error
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error al eliminar usuario ${userId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Error al eliminar usuario');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Activa o desactiva un usuario en una transacción
     * 
     * @param userId - ID del usuario
     * @param isActive - Estado activo/inactivo
     * @returns Usuario actualizado
     */
    async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const action = isActive ? 'activar' : 'desactivar';
        this.logger.log(`Iniciando transacción para ${action} usuario: ${userId}`);

        try {
            // 1. Verificar que el usuario existe
            const user = await this.userCrudService.findById(userId);
            if (!user) {
                throw new Error(`Usuario no encontrado: ${userId}`);
            }

            // 2. Actualizar estado
            await this.userCrudService.updateUserStatusTransaction(userId, isActive, queryRunner);
            this.logger.log(`Estado actualizado para usuario ${userId}: ${isActive ? 'ACTIVO' : 'INACTIVO'}`);

            // 3. Si se desactiva, opcional: log de roles afectados
            if (!isActive) {
                const userRoles = await this.userRolesService.getUserRoles(userId);
                this.logger.log(`Usuario desactivado tenía ${userRoles.length} roles asignados`);
            }

            // 4. Confirmar transacción
            await queryRunner.commitTransaction();
            this.logger.log(`Usuario ${action}do exitosamente: ${userId}`);

            // 5. Retornar usuario actualizado
            const updatedUser = await this.userCrudService.findById(userId);
            if (!updatedUser) {
                throw new InternalServerErrorException('Error al cargar usuario actualizado');
            }
            return updatedUser;

        } catch (error) {
            // Rollback en caso de error
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error al ${action} usuario ${userId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Error al ${action} usuario`);
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Operación compleja: crear múltiples usuarios con sus roles en una sola transacción
     * 
     * @param usersData - Array de datos de usuarios con sus roles
     * @returns Array de usuarios creados
     */
    async createMultipleUsersWithRoles(usersData: Array<{
        userData: CreateUserDto;
        rolesIds: number[];
    }>): Promise<User[]> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        this.logger.log(`Iniciando transacción para crear ${usersData.length} usuarios`);

        try {
            const createdUsers: User[] = [];

            for (let i = 0; i < usersData.length; i++) {
                const { userData, rolesIds } = usersData[i];
                this.logger.log(`Creando usuario ${i + 1}/${usersData.length}: ${userData.email}`);

                // Crear usuario base
                const newUser = await this.userCrudService.createUserBase(userData, queryRunner);

                // Asignar roles si se proporcionaron
                if (rolesIds && rolesIds.length > 0) {
                    await this.userRolesService.assignRolesToUserTransaction(newUser, rolesIds, queryRunner);
                }

                createdUsers.push(newUser);
            }

            // Confirmar transacción
            await queryRunner.commitTransaction();
            this.logger.log(`${createdUsers.length} usuarios creados exitosamente`);

            // Retornar usuarios con relaciones cargadas
            const userIds = createdUsers.map(user => user.id);
            return this.userCrudService.findByIds(userIds);

        } catch (error) {
            // Rollback en caso de error
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error al crear múltiples usuarios: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Error al crear múltiples usuarios');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Ejecuta una operación personalizada dentro de una transacción
     * 
     * @param operation - Función que recibe el QueryRunner y ejecuta operaciones
     * @returns Resultado de la operación
     */
    async executeInTransaction<T>(operation: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        this.logger.log('Iniciando transacción personalizada');

        try {
            const result = await operation(queryRunner);
            await queryRunner.commitTransaction();
            this.logger.log('Transacción personalizada completada exitosamente');
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error en transacción personalizada: ${error.message}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
