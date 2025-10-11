import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../jwt.strategy';

/**
 * Guard para verificar permisos específicos
 * 
 * Verifica que el usuario autenticado tenga los permisos requeridos
 * definidos mediante el decorador @RequirePermissions.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Obtener permisos requeridos del decorador
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si no hay permisos requeridos, permitir acceso
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        // Obtener usuario del request
        const request = context.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;

        // Verificar que el usuario esté autenticado
        if (!user) {
            throw new ForbiddenException('Usuario no autenticado');
        }

        // Verificar que el usuario tenga al menos uno de los permisos requeridos
        const hasPermission = requiredPermissions.some(permission => 
            user.permissions.includes(permission)
        );

        if (!hasPermission) {
            throw new ForbiddenException(
                `Acceso denegado. Permisos requeridos: ${requiredPermissions.join(', ')}`
            );
        }

        return true;
    }
}
