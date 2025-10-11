import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';

/**
 * Repositorio personalizado para consultas complejas de usuarios
 * 
 * Centraliza todas las consultas específicas y complejas de la entidad User,
 * separando la lógica de acceso a datos de la lógica de negocio.
 */
@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>
    ) {}

    /**
     * Busca un usuario por email incluyendo la contraseña
     * 
     * @param email - Email del usuario
     * @returns Usuario con contraseña o null
     */
    async findByEmailWithPassword(email: string): Promise<User | null> {
        return this.repository.createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('roles.permisos', 'permisos')
            .getOne();
    }

    /**
     * Obtiene todos los usuarios activos con sus relaciones
     * 
     * @returns Lista de usuarios activos con roles y permisos
     */
    async findAllActive(): Promise<User[]> {
        return this.repository.find({
            where: { isActive: true },
            relations: ['roles', 'roles.permisos'],
            order: { name: 'ASC' }
        });
    }

    /**
     * Verifica si existe un usuario con el email dado
     * 
     * @param email - Email a verificar
     * @param excludeId - ID a excluir de la búsqueda (para actualizaciones)
     * @returns true si existe, false si no
     */
    async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
        const query = this.repository.createQueryBuilder('user')
            .where('user.email = :email', { email });
        
        if (excludeId) {
            query.andWhere('user.id != :excludeId', { excludeId });
        }
        
        const count = await query.getCount();
        return count > 0;
    }

    /**
     * Busca un usuario por ID con todas sus relaciones
     * 
     * @param id - ID del usuario
     * @returns Usuario con relaciones completas o null
     */
    async findByIdWithRelations(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['roles', 'roles.permisos']
        });
    }

    /**
     * Obtiene solo los permisos únicos de un usuario
     * 
     * @param userId - ID del usuario
     * @returns Array de nombres de permisos únicos
     */
    async getUserPermissions(userId: string): Promise<string[]> {
        const result = await this.repository
            .createQueryBuilder('user')
            .leftJoin('user.roles', 'roles')
            .leftJoin('roles.permisos', 'permisos')
            .select('DISTINCT permisos.name', 'permission')
            .where('user.id = :userId', { userId })
            .andWhere('permisos.isActive = :isActive', { isActive: true })
            .getRawMany();

        return result.map(row => row.permission).filter(permission => permission !== null);
    }

    /**
     * Verifica si un usuario tiene un permiso específico
     * 
     * @param userId - ID del usuario
     * @param permissionName - Nombre del permiso
     * @returns true si tiene el permiso, false si no
     */
    async hasPermission(userId: string, permissionName: string): Promise<boolean> {
        const count = await this.repository
            .createQueryBuilder('user')
            .leftJoin('user.roles', 'roles')
            .leftJoin('roles.permisos', 'permisos')
            .where('user.id = :userId', { userId })
            .andWhere('permisos.name = :permissionName', { permissionName })
            .andWhere('permisos.isActive = :isActive', { isActive: true })
            .getCount();

        return count > 0;
    }

    /**
     * Obtiene usuarios por múltiples IDs
     * 
     * @param ids - Array de IDs de usuarios
     * @returns Array de usuarios encontrados
     */
    async findByIds(ids: string[]): Promise<User[]> {
        if (ids.length === 0) return [];
        
        return this.repository.find({
            where: { id: In(ids) },
            relations: ['roles', 'roles.permisos']
        });
    }
}
