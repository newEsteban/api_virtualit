import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

/**
 * Payload del JWT
 * 
 * Define la estructura de los datos que se almacenan en el token JWT.
 * OPTIMIZADO: Solo incluye el ID del usuario para reducir el tamaño del token.
 */
export interface JwtPayload {
    sub: string;        // Subject - ID del usuario
    iat?: number;       // Issued at - fecha de emisión
    exp?: number;       // Expiration - fecha de expiración
    jti?: string;       // JWT ID - Identificador único del token (opcional)
}

/**
 * Usuario autenticado extendido con permisos
 * 
 * Representa el usuario autenticado con toda la información
 * necesaria para la autorización.
 */
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    roles: Array<{
        id: number;
        name: string;
        description: string;
        priority: number;
        isActive: boolean;
        isSystem: boolean;
        permisos: Array<{
            id: number;
            name: string;
            description: string;
            resource: string;
            action: string;
        }>;
    }>;
    permissions: string[]; // Array de permisos formateados como "resource:action"
}

/**
 * Estrategia JWT para Passport
 * 
 * Implementa la validación de tokens JWT y extrae la información
 * del usuario autenticado junto con sus roles y permisos.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly tokenBlacklistService: TokenBlacklistService,
    ) {
        super({
            // Extraer JWT del header Authorization como Bearer token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // No ignorar expiración del token
            ignoreExpiration: false,
            // Clave secreta para validar el token
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
            // Necesario para acceder al request y obtener el token
            passReqToCallback: true,
        });
    }

    /**
     * Valida el payload del JWT y retorna el usuario autenticado
     * 
     * Este método se ejecuta automáticamente cuando se valida un JWT.
     * Passport llama a este método después de verificar la firma del token.
     * 
     * @param request - Request HTTP para extraer el token
     * @param payload - Payload decodificado del JWT
     * @returns Usuario autenticado con roles y permisos
     * @throws UnauthorizedException si el usuario no existe o está inactivo
     */
    async validate(request: any, payload: JwtPayload): Promise<AuthenticatedUser> {
        const { sub: userId } = payload;

        // Extraer el token del header Authorization
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        
        // Verificar si el token está en la blacklist
        if (token && this.tokenBlacklistService.isTokenBlacklisted(token)) {
            throw new UnauthorizedException('Token invalidado por logout');
        }

        // Buscar el usuario con sus roles y permisos
        const user = await this.userService.findOne(userId);

        if (!user) {
            throw new UnauthorizedException('Token inválido: usuario no encontrado');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Token inválido: usuario inactivo');
        }

        // Verificar que las relaciones estén cargadas
        if (!user.roles) {
            throw new UnauthorizedException('Error interno: relaciones de usuario no cargadas');
        }

        // Extraer permisos únicos de todos los roles del usuario
        const permissions = this.extractUserPermissions(user);

        // Retornar usuario autenticado con información completa
        const authenticatedUser: AuthenticatedUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            isActive: user.isActive,
            roles: (user.roles || []).map(role => ({
                id: role.id,
                name: role.name,
                description: role.description,
                priority: role.priority,
                isActive: role.isActive,
                isSystem: role.isSystem,
                permisos: (role.permisos || []).map(permiso => ({
                    id: permiso.id,
                    name: permiso.name,
                    description: permiso.description,
                    resource: permiso.resource,
                    action: permiso.action,
                })),
            })),
            permissions,
        };

        return authenticatedUser;
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
        (user.roles || []).forEach(role => {
            // Solo incluir permisos de roles activos
            if (role.isActive) {
                (role.permisos || []).forEach(permiso => {
                    // Formatear permiso como "resource:action"
                    permissionsSet.add(`${permiso.resource}:${permiso.action}`);
                });
            }
        });

        return Array.from(permissionsSet);
    }
}
