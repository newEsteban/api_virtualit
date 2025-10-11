import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { JwtPayload, AuthenticatedUser } from './jwt.strategy';
import { TokenBlacklistService } from './services/token-blacklist.service';

/**
 * Respuesta del login exitoso
 */
export interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
        id: string;
        email: string;
        name: string;
        roles: string[];
        permissions: string[];
    };
}

/**
 * Servicio de autenticación
 * 
 * Maneja el login, validación de credenciales y generación de tokens JWT.
 * Se integra con el sistema de roles y permisos.
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService,
    ) {}

    /**
     * Autentica un usuario con email y contraseña
     * 
     * @param loginDto - Datos de login (email y contraseña)
     * @returns Token JWT y datos del usuario autenticado
     * @throws UnauthorizedException si las credenciales son inválidas
     * @throws BadRequestException si el usuario está inactivo
     */
    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { email, password } = loginDto;

        // Buscar usuario por email con su contraseña
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase().trim() },
            relations: ['roles', 'roles.permisos'],
            select: ['id', 'email', 'name', 'password', 'isActive'], // Incluir password explícitamente
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Verificar que el usuario esté activo
        if (!user.isActive) {
            throw new BadRequestException('Usuario inactivo. Contacte al administrador.');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Extraer permisos únicos de todos los roles del usuario
        const permissions = this.extractUserPermissions(user);

        // Crear payload para JWT (OPTIMIZADO: solo ID del usuario)
        const payload: JwtPayload = {
            sub: user.id,
        };

        // Generar token JWT
        const access_token = this.jwtService.sign(payload);

        // Invalidar token anterior del usuario (si existe) y registrar el nuevo
        const decoded = this.jwtService.decode(access_token) as any;
        const tokenExp = decoded?.exp || Math.floor(Date.now() / 1000) + 3600;
        this.tokenBlacklistService.invalidatePreviousUserToken(user.id, access_token, tokenExp);

        // Retornar respuesta de login
        return {
            access_token,
            token_type: 'Bearer',
            expires_in: 3600, // 1 hora por defecto
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles?.map(role => role.name) || [],
                permissions,
            },
        };
    }

    /**
     * Valida un usuario por su ID
     * 
     * Método usado por JWT Strategy para validar usuarios después de
     * verificar el token.
     * 
     * @param userId - ID del usuario
     * @returns Usuario con roles y permisos o null si no existe
     */
    async validateUser(userId: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { id: userId, isActive: true },
            relations: ['roles', 'roles.permisos'],
        });
    }

    /**
     * Obtiene el perfil del usuario autenticado
     * 
     * @param user - Usuario autenticado desde el JWT
     * @returns Perfil completo del usuario
     */
    async getProfile(user: AuthenticatedUser) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            isActive: user.isActive,
            roles: user.roles,
            permissions: user.permissions,
            totalRoles: user.roles.length,
            totalPermissions: user.permissions.length,
        };
    }

    /**
     * Verifica si un usuario tiene un permiso específico
     * 
     * @param user - Usuario autenticado
     * @param permission - Permiso a verificar (formato: "resource:action")
     * @returns true si el usuario tiene el permiso
     */
    hasPermission(user: AuthenticatedUser, permission: string): boolean {
        return user.permissions.includes(permission);
    }

    /**
     * Verifica si un usuario tiene alguno de los permisos especificados
     * 
     * @param user - Usuario autenticado
     * @param permissions - Array de permisos a verificar
     * @returns true si el usuario tiene al menos uno de los permisos
     */
    hasAnyPermission(user: AuthenticatedUser, permissions: string[]): boolean {
        return permissions.some(permission => user.permissions.includes(permission));
    }

    /**
     * Verifica si un usuario tiene todos los permisos especificados
     * 
     * @param user - Usuario autenticado
     * @param permissions - Array de permisos requeridos
     * @returns true si el usuario tiene todos los permisos
     */
    hasAllPermissions(user: AuthenticatedUser, permissions: string[]): boolean {
        return permissions.every(permission => user.permissions.includes(permission));
    }

    /**
     * Extrae todos los permisos únicos del usuario desde sus roles
     * 
     * @param user - Usuario con roles y permisos cargados
     * @returns Array de permisos formateados como "resource:action"
     */
    private extractUserPermissions(user: any): string[] {
        const permissionsSet = new Set<string>();

        // Iterar sobre todos los roles del usuario
        user.roles?.forEach(role => {
            // Solo incluir permisos de roles activos
            if (role.isActive) {
                role.permisos?.forEach(permiso => {
                    // Solo incluir permisos activos
                    if (permiso.isActive) {
                        // Formatear permiso como "resource:action"
                        permissionsSet.add(`${permiso.resource}:${permiso.action}`);
                    }
                });
            }
        });

        return Array.from(permissionsSet);
    }

    /**
     * Cierra la sesión del usuario invalidando el token JWT
     * 
     * @param token - Token JWT a invalidar
     * @returns Mensaje de confirmación
     */
    async logout(token: string): Promise<{ message: string }> {
        try {
            // Decodificar el token para obtener su expiración
            const decoded = this.jwtService.decode(token) as any;
            
            if (!decoded || !decoded.exp) {
                throw new BadRequestException('Token inválido');
            }

            // Añadir token a la blacklist con su tiempo de expiración
            this.tokenBlacklistService.addToBlacklist(token, decoded.exp);

            return {
                message: 'Logout exitoso. Token invalidado.',
            };
        } catch (error) {
            // Si el token ya expiró o es inválido, consideramos el logout exitoso
            return {
                message: 'Logout exitoso.',
            };
        }
    }

    /**
     * Verifica si un token está en la blacklist
     * 
     * @param token - Token a verificar
     * @returns true si el token está invalidado
     */
    isTokenBlacklisted(token: string): boolean {
        return this.tokenBlacklistService.isTokenBlacklisted(token);
    }

    /**
     * Invalida todos los tokens de un usuario específico
     * 
     * @param userId - ID del usuario
     * @returns Mensaje de confirmación
     */
    async logoutAll(userId: string): Promise<{ message: string }> {
        this.tokenBlacklistService.invalidateAllUserTokens(userId);
        return {
            message: 'Todas las sesiones del usuario han sido invalidadas.',
        };
    }

    /**
     * Obtiene estadísticas del sistema de tokens
     */
    getTokenStats() {
        return this.tokenBlacklistService.getStats();
    }
}
