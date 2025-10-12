import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GitLabService } from './services/gitlab.service';
import { GitLabController } from './controllers/gitlab.controller';

/**
 * Módulo GitLab
 * 
 * Proporciona integración completa con la API de GitLab v4:
 * - Servicio para interactuar con GitLab API
 * - Controlador REST con endpoints para todas las operaciones
 * - Configuración condicional basada en variables de entorno
 * 
 * Características:
 * - Gestión de proyectos
 * - Manejo de issues y merge requests
 * - Usuarios, branches, commits, pipelines
 * - Labels y milestones
 * - Conexión condicional (habilitada/deshabilitada)
 */
@Module({
    imports: [
        ConfigModule, // Para acceder a variables de entorno GitLab
    ],
    controllers: [GitLabController],
    providers: [GitLabService],
    exports: [GitLabService], // Exportar para uso en otros módulos
})
export class GitLabModule { }