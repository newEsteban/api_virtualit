import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryRunner } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user-dto';
import { UpdateUserDto } from '../dtos/update-user-dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';

/**
 * Servicio para operaciones CRUD básicas de usuarios
 * 
 * Maneja las operaciones básicas de creación, lectura, actualización y eliminación
 * de usuarios, delegando consultas complejas al UserRepository.
 */
@Injectable()
export class UserCrudService {
    private readonly logger = new Logger(UserCrudService.name);

    constructor(
        private readonly userRepository: UserRepository,
        @InjectRepository(User)
        private readonly repository: Repository<User>
    ) {}

    /**
     * Obtiene todos los usuarios activos con sus roles
     * 
     * @param page - Número de página (opcional)
     * @param limit - Límite de resultados por página (opcional)
     * @returns Array de usuarios activos con sus roles y permisos
     */
    async findAll(page?: number, limit?: number): Promise<User[]> {
        this.logger.log('Obteniendo todos los usuarios activos');
        
        if (page && limit) {
            this.logger.log(`Aplicando paginación: página ${page}, límite ${limit}`);
            // TODO: Implementar paginación en UserRepository
            return this.userRepository.findAllActive();
        }
        
        return this.userRepository.findAllActive();
    }

    /**
     * Obtiene un usuario por su ID
     * 
     * @param id - ID del usuario
     * @returns Usuario encontrado con sus roles y permisos
     * @throws NotFoundException si no se encuentra el usuario
     */
    async findOne(id: string): Promise<User> {
        this.logger.log(`Buscando usuario con ID: ${id}`);
        
        const user = await this.userRepository.findByIdWithRelations(id);

        if (!user) {
            this.logger.warn(`Usuario con ID ${id} no encontrado`);
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        this.logger.log(`Usuario ${id} encontrado: ${user.name}`);
        return user;
    }

    /**
     * Busca un usuario por email
     * 
     * @param email - Email del usuario
     * @param includePassword - Si incluir la contraseña en el resultado
     * @returns Usuario encontrado o null
     */
    async findByEmail(email: string, includePassword = false): Promise<User | null> {
        this.logger.log(`Buscando usuario por email: ${email} (includePassword: ${includePassword})`);
        
        if (includePassword) {
            return this.userRepository.findByEmailWithPassword(email);
        }

        const user = await this.repository.findOne({
            where: { email },
            relations: ['roles', 'roles.permisos']
        });

        if (user) {
            this.logger.log(`Usuario encontrado por email ${email}: ${user.name}`);
        } else {
            this.logger.log(`No se encontró usuario con email: ${email}`);
        }

        return user;
    }

    /**
     * Verifica si existe un usuario con el email dado
     * 
     * @param email - Email a verificar
     * @param excludeId - ID a excluir de la búsqueda (para actualizaciones)
     * @returns true si existe, false si no
     */
    async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
        this.logger.log(`Verificando existencia de email: ${email}${excludeId ? ` (excluyendo ID: ${excludeId})` : ''}`);
        
        const exists = await this.userRepository.existsByEmail(email, excludeId);
        
        this.logger.log(`Email ${email} ${exists ? 'ya existe' : 'disponible'}`);
        return exists;
    }

    /**
     * Elimina un usuario (soft delete)
     * 
     * @param id - ID del usuario a eliminar
     * @returns Resultado de la eliminación
     * @throws NotFoundException si no se encuentra el usuario
     */
    async remove(id: string): Promise<{ message: string }> {
        this.logger.log(`Iniciando eliminación de usuario: ${id}`);
        
        const user = await this.findOne(id);
        await this.repository.softDelete(id);
        
        this.logger.log(`Usuario ${user.name} (${id}) eliminado correctamente`);
        return { message: `Usuario ${user.name} eliminado correctamente` };
    }

    /**
     * Obtiene múltiples usuarios por sus IDs
     * 
     * @param ids - Array de IDs de usuarios
     * @returns Array de usuarios encontrados
     */
    async findByIds(ids: string[]): Promise<User[]> {
        if (ids.length === 0) {
            this.logger.log('Array de IDs vacío, retornando array vacío');
            return [];
        }

        this.logger.log(`Buscando ${ids.length} usuarios por IDs`);
        const users = await this.userRepository.findByIds(ids);
        this.logger.log(`Encontrados ${users.length} usuarios de ${ids.length} solicitados`);
        
        return users;
    }

    /**
     * Cuenta el total de usuarios activos
     * 
     * @returns Número total de usuarios activos
     */
    async count(): Promise<number> {
        const count = await this.repository.count({
            where: { isActive: true }
        });
        
        this.logger.log(`Total de usuarios activos: ${count}`);
        return count;
    }

    /**
     * Busca usuarios por nombre (búsqueda parcial)
     * 
     * @param name - Nombre o parte del nombre a buscar
     * @returns Array de usuarios que coinciden con la búsqueda
     */
    async findByName(name: string): Promise<User[]> {
        this.logger.log(`Buscando usuarios por nombre: ${name}`);
        
        const users = await this.repository
            .createQueryBuilder('user')
            .where('user.name ILIKE :name', { name: `%${name}%` })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('roles.permisos', 'permisos')
            .orderBy('user.name', 'ASC')
            .getMany();

        this.logger.log(`Encontrados ${users.length} usuarios con nombre similar a: ${name}`);
        return users;
    }

    // =================== MÉTODOS PARA TRANSACCIONES ===================

    /**
     * Crea un usuario base dentro de una transacción
     * 
     * @param createUserDto - Datos del usuario a crear
     * @param queryRunner - QueryRunner de la transacción
     * @returns Usuario creado
     */
    async createUserBase(createUserDto: CreateUserDto, queryRunner: QueryRunner): Promise<User> {
        this.logger.log(`[TRANSACCIÓN] Creando usuario base: ${createUserDto.email}`);
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        
        // Crear entidad de usuario
        const newUser = queryRunner.manager.create(User, {
            name: createUserDto.name,
            email: createUserDto.email,
            password: hashedPassword,
            isActive: true, // Por defecto los usuarios se crean activos
            roles: [] // Se asignarán después si es necesario
        });

        // Guardar usuario
        const savedUser = await queryRunner.manager.save(User, newUser);
        this.logger.log(`[TRANSACCIÓN] Usuario base creado: ${savedUser.id}`);
        
        return savedUser;
    }

    /**
     * Busca un usuario por ID con relaciones cargadas
     * 
     * @param userId - ID del usuario
     * @returns Usuario con relaciones o null si no existe
     */
    async findByIdWithRelations(userId: string): Promise<User | null> {
        this.logger.log(`Buscando usuario con relaciones: ${userId}`);
        
        const user = await this.repository.findOne({
            where: { id: userId },
            relations: ['roles', 'roles.permisos']
        });

        if (user) {
            this.logger.log(`Usuario encontrado con relaciones: ${userId}`);
        } else {
            this.logger.log(`Usuario no encontrado: ${userId}`);
        }

        return user;
    }

    /**
     * Busca un usuario por ID (método simple)
     * 
     * @param userId - ID del usuario
     * @returns Usuario o null si no existe
     */
    async findById(userId: string): Promise<User | null> {
        this.logger.log(`Buscando usuario por ID: ${userId}`);
        
        const user = await this.repository.findOne({
            where: { id: userId }
        });

        if (user) {
            this.logger.log(`Usuario encontrado: ${userId}`);
        } else {
            this.logger.log(`Usuario no encontrado: ${userId}`);
        }

        return user;
    }

    /**
     * Elimina un usuario dentro de una transacción
     * 
     * @param userId - ID del usuario a eliminar
     * @param queryRunner - QueryRunner de la transacción
     */
    async deleteUserTransaction(userId: string, queryRunner: QueryRunner): Promise<void> {
        this.logger.log(`[TRANSACCIÓN] Eliminando usuario: ${userId}`);
        
        const result = await queryRunner.manager.delete(User, { id: userId });
        
        if (result.affected === 0) {
            throw new NotFoundException(`Usuario no encontrado para eliminar: ${userId}`);
        }
        
        this.logger.log(`[TRANSACCIÓN] Usuario eliminado: ${userId}`);
    }

    /**
     * Actualiza el estado activo/inactivo de un usuario dentro de una transacción
     * 
     * @param userId - ID del usuario
     * @param isActive - Nuevo estado
     * @param queryRunner - QueryRunner de la transacción
     */
    async updateUserStatusTransaction(userId: string, isActive: boolean, queryRunner: QueryRunner): Promise<void> {
        this.logger.log(`[TRANSACCIÓN] Actualizando estado de usuario ${userId} a: ${isActive ? 'ACTIVO' : 'INACTIVO'}`);
        
        const result = await queryRunner.manager.update(User, { id: userId }, { isActive });
        
        if (result.affected === 0) {
            throw new NotFoundException(`Usuario no encontrado para actualizar: ${userId}`);
        }
        
        this.logger.log(`[TRANSACCIÓN] Estado actualizado para usuario: ${userId}`);
    }

    /**
     * Actualiza un usuario existente
     * 
     * @param userId - ID del usuario a actualizar
     * @param updateUserDto - Datos de actualización
     * @returns Usuario actualizado
     */
    async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        this.logger.log(`Actualizando usuario: ${userId}`);
        
        // Verificar que el usuario existe
        const existingUser = await this.findById(userId);
        if (!existingUser) {
            throw new NotFoundException(`Usuario no encontrado: ${userId}`);
        }

        // Preparar datos de actualización
        const updateData: Partial<User> = {};
        
        if (updateUserDto.name) {
            updateData.name = updateUserDto.name;
        }
        
        if (updateUserDto.email) {
            // Verificar que el email no esté en uso por otro usuario
            const existingEmail = await this.repository.findOne({
                where: { email: updateUserDto.email }
            });
            
            if (existingEmail && existingEmail.id !== userId) {
                throw new ConflictException(`El email ${updateUserDto.email} ya está en uso`);
            }
            
            updateData.email = updateUserDto.email;
        }

        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        // Actualizar usuario
        await this.repository.update(userId, updateData);
        
        // Retornar usuario actualizado
        const updatedUser = await this.findById(userId);
        this.logger.log(`Usuario actualizado exitosamente: ${userId}`);
        
        return updatedUser!; // Sabemos que existe porque verificamos antes
    }
}
