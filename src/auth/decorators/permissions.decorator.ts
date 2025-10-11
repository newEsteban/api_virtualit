import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para requerir permisos específicos
 * 
 * Define los permisos necesarios para acceder a un endpoint.
 * Se debe usar junto con PermissionsGuard.
 * 
 * @param permissions - Array de permisos requeridos (formato: "resource:action")
 * 
 * @example
 * ```typescript
 * @Get()
 * @UseGuards(AuthGuard('jwt'), PermissionsGuard)
 * @RequirePermissions(['users:read'])
 * findAll() {
 *   return this.userService.findAll();
 * }
 * ```
 */
export const RequirePermissions = (...permissions: string[]) => 
    SetMetadata('permissions', permissions);

/**
 * Decorador para requerir que el usuario sea administrador del sistema
 * 
 * Verifica que el usuario tenga permisos de administrador general.
 * 
 * @example
 * ```typescript
 * @Delete(':id')
 * @UseGuards(AuthGuard('jwt'), PermissionsGuard)
 * @RequireAdmin()
 * remove(@Param('id') id: string) {
 *   return this.userService.remove(id);
 * }
 * ```
 */
export const RequireAdmin = () => 
    RequirePermissions('system:admin');

/**
 * Decorador para operaciones de lectura
 * 
 * @param resource - Recurso al que aplica (ej: 'users', 'roles', 'permissions')
 */
export const RequireRead = (resource: string) => 
    RequirePermissions(`${resource}:read`);

/**
 * Decorador para operaciones de creación
 * 
 * @param resource - Recurso al que aplica
 */
export const RequireCreate = (resource: string) => 
    RequirePermissions(`${resource}:create`);

/**
 * Decorador para operaciones de actualización
 * 
 * @param resource - Recurso al que aplica
 */
export const RequireUpdate = (resource: string) => 
    RequirePermissions(`${resource}:update`);

/**
 * Decorador para operaciones de eliminación
 * 
 * @param resource - Recurso al que aplica
 */
export const RequireDelete = (resource: string) => 
    RequirePermissions(`${resource}:delete`);

/**
 * Decorador para obtener el usuario autenticado
 * 
 * Extrae el usuario autenticado del request para usar en los controladores.
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(AuthGuard('jwt'))
 * getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   return { user };
 * }
 * ```
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../jwt.strategy';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
