import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

/**
 * DTO para asignar permisos a un rol
 * 
 * Define la estructura para asignar múltiples permisos a un rol específico.
 */
export class AssignPermisosDto {
    /**
     * Array de IDs de permisos a asignar al rol
     */
    @IsArray()
    @IsNotEmpty()
    @IsInt({ each: true })
    permisoIds: number[];
}
