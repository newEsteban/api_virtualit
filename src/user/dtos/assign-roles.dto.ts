import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

/**
 * DTO para asignar roles a un usuario
 * 
 * Define la estructura para asignar múltiples roles a un usuario específico.
 */
export class AssignRolesDto {
    /**
     * Array de IDs de roles a asignar al usuario
     */
    @IsArray()
    @IsNotEmpty()
    @IsInt({ each: true })
    rolIds: number[];
}
