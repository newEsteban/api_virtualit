import { 
    Controller, 
    Post, 
    Body, 
    Get, 
    UseGuards, 
    Request,
    HttpCode,
    HttpStatus,
    Headers
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './jwt.strategy';

/**
 * Request extendido con usuario autenticado
 */
interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}

/**
 * Controlador de autenticación
 * 
 * Maneja las rutas relacionadas con autenticación y autorización.
 * Incluye login, perfil de usuario y verificación de permisos.
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Login de usuario
     * 
     * Autentica un usuario con email y contraseña, retorna un JWT.
     * 
     * @param loginDto - Datos de login (email y contraseña)
     * @returns Token JWT y datos del usuario
     * 
     * @example
     * POST /api/auth/login
     * {
     *   "email": "admin@virtualit.com",
     *   "password": "Admin123!"
     * }
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }

    /**
     * Obtener perfil del usuario autenticado
     * 
     * Retorna el perfil completo del usuario autenticado incluidos
     * sus roles y permisos.
     * 
     * @param req - Request con usuario autenticado
     * @returns Perfil del usuario con roles y permisos
     * 
     * @example
     * GET /api/auth/profile
     * Authorization: Bearer <jwt_token>
     */
    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Request() req: AuthenticatedRequest) {
        return await this.authService.getProfile(req.user);
    }

    /**
     * Verificar permisos del usuario
     * 
     * Endpoint para verificar si el usuario autenticado tiene
     * permisos específicos.
     * 
     * @param req - Request con usuario autenticado
     * @returns Lista de permisos del usuario
     * 
     * @example
     * GET /api/auth/permissions
     * Authorization: Bearer <jwt_token>
     */
    @Get('permissions')
    @UseGuards(AuthGuard('jwt'))
    async getPermissions(@Request() req: AuthenticatedRequest) {
        return {
            permissions: req.user.permissions,
            totalPermissions: req.user.permissions.length,
            roles: req.user.roles.map(role => ({
                id: role.id,
                name: role.name,
                description: role.description,
                priority: role.priority,
                permissionsCount: role.permisos.length,
            })),
        };
    }

    /**
     * Verificar estado de autenticación
     * 
     * Endpoint simple para verificar si el token JWT es válido.
     * 
     * @param req - Request con usuario autenticado
     * @returns Estado de autenticación
     * 
     * @example
     * GET /api/auth/verify
     * Authorization: Bearer <jwt_token>
     */
    @Get('verify')
    @UseGuards(AuthGuard('jwt'))
    async verifyToken(@Request() req: AuthenticatedRequest) {
        return {
            isAuthenticated: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                isActive: req.user.isActive,
            },
            message: 'Token válido',
        };
    }

    /**
     * Cerrar sesión
     * 
     * Invalida el token JWT actual del usuario.
     * 
     * @param authorization - Header Authorization con el token
     * @returns Mensaje de confirmación
     * 
     * @example
     * POST /api/auth/logout
     * Authorization: Bearer <jwt_token>
     */
    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async logout(@Headers('authorization') authorization: string): Promise<{ message: string }> {
        // Extraer el token del header "Bearer <token>"
        const token = authorization?.replace('Bearer ', '');
        
        if (!token) {
            return { message: 'No hay token para invalidar' };
        }

        return await this.authService.logout(token);
    }

    /**
     * Cerrar todas las sesiones de un usuario
     * 
     * Invalida todos los tokens activos del usuario autenticado.
     * 
     * @param req - Request con usuario autenticado
     * @returns Mensaje de confirmación
     * 
     * @example
     * POST /api/auth/logout-all
     * Authorization: Bearer <jwt_token>
     */
    @Post('logout-all')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async logoutAll(@Request() req: AuthenticatedRequest): Promise<{ message: string }> {
        return await this.authService.logoutAll(req.user.id);
    }

    /**
     * Verificar estado del token
     * 
     * Incluye información sobre si el token está en blacklist
     * 
     * @param authorization - Header Authorization con el token
     * @param req - Request con usuario autenticado
     * @returns Estado detallado del token
     * 
     * @example
     * GET /api/auth/token-status
     * Authorization: Bearer <jwt_token>
     */
    @Get('token-status')
    @UseGuards(AuthGuard('jwt'))
    async getTokenStatus(
        @Headers('authorization') authorization: string,
        @Request() req: AuthenticatedRequest
    ) {
        const token = authorization?.replace('Bearer ', '');
        const isBlacklisted = token ? this.authService.isTokenBlacklisted(token) : false;

        return {
            isValid: !isBlacklisted,
            isBlacklisted,
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
            },
            tokenStats: this.authService.getTokenStats(),
            message: isBlacklisted ? 'Token invalidado' : 'Token válido',
        };
    }
}
