import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateRolDto } from './create-rol.dto';

/**
 * DTO para actualizar un rol existente
 * 
 * Extiende CreateRolDto haciendo todos los campos opcionales
 * y agrega campos específicos para actualización.
 */
export class UpdateRolDto extends PartialType(CreateRolDto) {
    /**
     * Indica si es un rol del sistema (opcional)
     * Los roles del sistema no pueden ser modificados o eliminados
     */
    @IsOptional()
    @IsBoolean()
    isSystem?: boolean;
}
