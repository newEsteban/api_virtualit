import { Controller, Get, Post, Body, Param, Delete, Put, Patch, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user-dto';
import { UpdateUserDto } from './dtos/update-user-dto';
import { AssignRolesDto } from './dtos/assign-roles.dto';
import { UserResponse } from './types/user-response.type';
import { RequirePermissions, RequireRead, RequireCreate, RequireUpdate, RequireDelete, CurrentUser } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

/**
 * Controlador de Usuarios
 * 
 * Maneja todas las operaciones REST relacionadas con usuarios:
 * - CRUD básico de usuarios
 * - Gestión de roles de usuarios
 * - Consulta de permisos de usuarios
 */
@Controller('users')
@UseGuards(AuthGuard('jwt'), PermissionsGuard) // JWT + guard de permisos
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    /**
     * Obtiene todos los usuarios con sus roles
     * 
     * @returns Array de usuarios con sus roles y permisos
     */
    @Get()
    @RequireRead('user')
    async findAll(): Promise<User[]> {
        return await this.userService.findAll();
    }

    /**
     * Obtiene un usuario específico por ID
     * 
     * @param id - ID del usuario
     * @returns Usuario con sus roles y permisos
     */
    @Get(':id')
    @RequireRead('user')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return await this.userService.findOne(id);
    }

    /**
     * Obtiene los permisos de un usuario
     * 
     * @param id - ID del usuario
     * @returns Array de nombres de permisos del usuario
     */
    @Get(':id/permissions')
    @RequireRead('user')
    async getUserPermissions(@Param('id', ParseUUIDPipe) id: string): Promise<string[]> {
        return await this.userService.getUserPermissions(id);
    }

    /**
     * Crea un nuevo usuario
     * 
     * @param createUserDto - Datos del usuario a crear
     * @returns Usuario creado sin contraseña
     */
    @Post()
    @RequireCreate('user')
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
        return await this.userService.create(createUserDto);
    }

    /**
     * Actualiza un usuario existente
     * 
     * @param id - ID del usuario a actualizar
     * @param updateUserDto - Datos de actualización
     * @returns Usuario actualizado sin contraseña
     */
    @Put(':id')
    @RequireUpdate('user')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<UserResponse> {
        return await this.userService.update(id, updateUserDto);
    }

    /**
     * Asigna roles a un usuario
     * 
     * @param id - ID del usuario
     * @param assignRolesDto - Roles a asignar
     * @returns Usuario con roles actualizados
     */
    @Patch(':id/roles')
    @RequirePermissions('user:assign-roles')
    async assignRoles(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() assignRolesDto: AssignRolesDto
    ): Promise<UserResponse> {
        return await this.userService.assignRoles(id, assignRolesDto);
    }

    /**
     * Remueve roles específicos de un usuario
     * 
     * @param id - ID del usuario
     * @param body - Objeto con array de IDs de roles a remover
     * @returns Usuario con roles actualizados
     */
    @Delete(':id/roles')
    @RequirePermissions('users:manage_roles')
    async removeRoles(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { rolIds: number[] }
    ): Promise<UserResponse> {
        return await this.userService.removeRoles(id, body.rolIds);
    }

    /**
     * Elimina un usuario (soft delete)
     * 
     * @param id - ID del usuario a eliminar
     * @returns Mensaje de confirmación
     */
    @Delete(':id')
    @RequireDelete('users')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        return await this.userService.remove(id);
    }
}
