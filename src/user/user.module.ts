import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Rol } from '../rol/entities/rol.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolModule } from '../rol/rol.module';
import { UserRepository } from './repositories/user.repository';
import { 
    UserCrudService, 
    UserRolesService, 
    UserPermissionsService, 
    UserTransactionService 
} from './services';

/**
 * Módulo de Usuarios - Arquitectura Modular
 * 
 * Implementa la separación de responsabilidades con servicios especializados:
 * 
 * Servicios Core:
 * - UserService: Orquestador principal (punto de entrada)
 * - UserCrudService: Operaciones CRUD básicas
 * - UserRolesService: Gestión de roles de usuarios
 * - UserPermissionsService: Consultas de permisos
 * - UserTransactionService: Operaciones transaccionales complejas
 * 
 * Repositorios:
 * - UserRepository: Consultas especializadas de base de datos
 * 
 * Controladores:
 * - UserController: Endpoints REST API
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([User, Rol]), // Incluir ambas entidades
        RolModule, // Importamos para usar RolService
    ],
    providers: [
        // Repositorio personalizado
        UserRepository,
        
        // Servicios especializados
        UserCrudService,
        UserRolesService,
        UserPermissionsService,
        UserTransactionService,
        
        // Servicio principal (orquestador)
        UserService,
    ],
    controllers: [UserController],
    exports: [
        UserService, // Servicio principal para otros módulos
        UserCrudService, // Para casos específicos que requieran CRUD básico
        UserRolesService, // Para módulos que gestionen roles
        UserPermissionsService, // Para guards y middleware de permisos
    ],
})
export class UserModule { }
