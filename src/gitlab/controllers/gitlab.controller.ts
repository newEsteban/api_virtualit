import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    Query,
    ParseIntPipe,
    Logger,
    HttpStatus,
    HttpException
} from '@nestjs/common';
import { GitLabService } from '../services/gitlab.service';
import {
    CreateIssueDto,
    UpdateIssueDto,
    FilterIssuesDto,
    CreateMergeRequestDto,
    CreateProjectDto
} from '../dto/gitlab.dto';

/**
 * Controlador para endpoints de GitLab API
 * 
 * Proporciona endpoints REST para interactuar con GitLab:
 * - Gestión de proyectos
 * - Manejo de issues
 * - Merge requests
 * - Usuarios y metadatos
 */
@Controller('gitlab')
export class GitLabController {
    private readonly logger = new Logger(GitLabController.name);

    constructor(private readonly gitlabService: GitLabService) { }

    // ==========================================
    // SALUD Y CONFIGURACIÓN
    // ==========================================

    /**
     * Verificar el estado del servicio GitLab
     * GET /gitlab/health
     */
    @Get('health')
    async checkHealth() {
        try {
            this.logger.log('🔍 Verificando salud del servicio GitLab...');

            const stats = this.gitlabService.getServiceStats();

            if (!stats.enabled) {
                return {
                    status: 'disabled',
                    message: 'GitLab API está deshabilitada',
                    enabled: false
                };
            }

            const connectionTest = await this.gitlabService.testConnection();

            return {
                status: connectionTest.success ? 'healthy' : 'error',
                message: connectionTest.success
                    ? 'GitLab API funcionando correctamente'
                    : `Error de conexión: ${connectionTest.error}`,
                enabled: stats.enabled,
                baseUrl: stats.baseUrl,
                defaultProjectId: stats.defaultProjectId,
                hasToken: stats.hasToken,
                user: connectionTest.user
            };

        } catch (error) {
            this.logger.error('❌ Error verificando salud de GitLab:', error.message);
            throw new HttpException(
                `Error verificando GitLab: ${error.message}`,
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }
    }

    /**
     * Obtener usuario actual
     * GET /gitlab/user
     */
    @Get('user')
    async getCurrentUser() {
        try {
            this.logger.log('👤 Obteniendo usuario actual de GitLab...');

            const user = await this.gitlabService.getCurrentUser();

            return {
                success: true,
                user,
                message: 'Usuario obtenido exitosamente'
            };

        } catch (error) {
            this.logger.error('❌ Error obteniendo usuario actual:', error.message);
            throw new HttpException(
                `Error obteniendo usuario: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // ==========================================
    // PROYECTOS
    // ==========================================

    /**
     * Obtener todos los proyectos
     * GET /gitlab/projects
     */
    @Get('projects')
    async getProjects() {
        try {
            this.logger.log('📁 Obteniendo proyectos de GitLab...');

            const projects = await this.gitlabService.getProjects();

            return {
                success: true,
                count: projects.length,
                projects,
                message: 'Proyectos obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error('❌ Error obteniendo proyectos:', error.message);
            throw new HttpException(
                `Error obteniendo proyectos: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Obtener un proyecto específico
     * GET /gitlab/projects/:id
     */
    @Get('projects/:id')
    async getProject(@Param('id', ParseIntPipe) projectId: number) {
        try {
            this.logger.log(`📁 Obteniendo proyecto ${projectId}...`);

            const project = await this.gitlabService.getProject(projectId);

            return {
                success: true,
                project,
                message: 'Proyecto obtenido exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error obteniendo proyecto ${projectId}:`, error.message);
            throw new HttpException(
                `Error obteniendo proyecto: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Crear un nuevo proyecto
     * POST /gitlab/projects
     */
    @Post('projects')
    async createProject(@Body() createProjectDto: CreateProjectDto) {
        try {
            this.logger.log(`📁 Creando proyecto: ${createProjectDto.name}...`);

            const project = await this.gitlabService.createProject(createProjectDto);

            return {
                success: true,
                project,
                message: 'Proyecto creado exitosamente'
            };

        } catch (error) {
            this.logger.error('❌ Error creando proyecto:', error.message);
            throw new HttpException(
                `Error creando proyecto: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // ==========================================
    // ISSUES
    // ==========================================

    /**
     * Obtener issues con filtros opcionales
     * GET /gitlab/issues?project_id=123&state=opened&labels=bug,feature
     */
    @Get('issues')
    async getIssues(
        @Query('project_id', new ParseIntPipe({ optional: true })) projectId?: number,
        @Query() filters?: FilterIssuesDto
    ) {
        try {
            this.logger.log(`🎫 Obteniendo issues del proyecto ${projectId || 'por defecto'}...`);

            const issues = await this.gitlabService.getIssues(projectId, filters);

            return {
                success: true,
                count: issues.length,
                issues,
                filters: filters || {},
                message: 'Issues obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error('❌ Error obteniendo issues:', error.message);
            throw new HttpException(
                `Error obteniendo issues: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Obtener un issue específico
     * GET /gitlab/issues/:iid?project_id=123
     */
    @Get('issues/:iid')
    async getIssue(
        @Param('iid', ParseIntPipe) issueIid: number,
        @Query('project_id', new ParseIntPipe({ optional: true })) projectId?: number
    ) {
        try {
            this.logger.log(`🎫 Obteniendo issue ${issueIid} del proyecto ${projectId || 'por defecto'}...`);

            const issue = await this.gitlabService.getIssue(issueIid, projectId);

            return {
                success: true,
                issue,
                message: 'Issue obtenido exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error obteniendo issue ${issueIid}:`, error.message);
            throw new HttpException(
                `Error obteniendo issue: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Crear un nuevo issue
     * POST /gitlab/issues
     */
    @Post('issues')
    async createIssue(@Body() createIssueDto: CreateIssueDto) {
        try {
            this.logger.log(`🎫 Creando issue: ${createIssueDto.title}...`);

            const issue = await this.gitlabService.createIssue(createIssueDto);

            return {
                success: true,
                issue,
                message: 'Issue creado exitosamente'
            };

        } catch (error) {
            this.logger.error('❌ Error creando issue:', error.message);
            throw new HttpException(
                `Error creando issue: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Actualizar un issue
     * PUT /gitlab/issues/:iid?project_id=123
     */
    @Put('issues/:iid')
    async updateIssue(
        @Param('iid', ParseIntPipe) issueIid: number,
        @Body() updateIssueDto: UpdateIssueDto,
        @Query('project_id', new ParseIntPipe({ optional: true })) projectId?: number
    ) {
        try {
            this.logger.log(`🎫 Actualizando issue ${issueIid}...`);

            const issue = await this.gitlabService.updateIssue(issueIid, updateIssueDto, projectId);

            return {
                success: true,
                issue,
                message: 'Issue actualizado exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error actualizando issue ${issueIid}:`, error.message);
            throw new HttpException(
                `Error actualizando issue: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Cerrar un issue
     * PUT /gitlab/issues/:iid/close?project_id=123
     */
    @Put('issues/:iid/close')
    async closeIssue(
        @Param('iid', ParseIntPipe) issueIid: number,
        @Query('project_id', new ParseIntPipe({ optional: true })) projectId?: number
    ) {
        try {
            this.logger.log(`🎫 Cerrando issue ${issueIid}...`);

            const issue = await this.gitlabService.closeIssue(issueIid, projectId);

            return {
                success: true,
                issue,
                message: 'Issue cerrado exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error cerrando issue ${issueIid}:`, error.message);
            throw new HttpException(
                `Error cerrando issue: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Reabrir un issue
     * PUT /gitlab/issues/:iid/reopen?project_id=123
     */
    @Put('issues/:iid/reopen')
    async reopenIssue(
        @Param('iid', ParseIntPipe) issueIid: number,
        @Query('project_id', new ParseIntPipe({ optional: true })) projectId?: number
    ) {
        try {
            this.logger.log(`🎫 Reabriendo issue ${issueIid}...`);

            const issue = await this.gitlabService.reopenIssue(issueIid, projectId);

            return {
                success: true,
                issue,
                message: 'Issue reabierto exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error reabriendo issue ${issueIid}:`, error.message);
            throw new HttpException(
                `Error reabriendo issue: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // ==========================================
    // MERGE REQUESTS
    // ==========================================

    /**
     * Obtener merge requests
     * GET /gitlab/merge-requests?project_id=123
     */
    @Get('merge-requests')
    async getMergeRequests(
        @Query('project_id', new ParseIntPipe({ optional: true })) projectId?: number
    ) {
        try {
            this.logger.log(`🔄 Obteniendo merge requests del proyecto ${projectId || 'por defecto'}...`);

            const mergeRequests = await this.gitlabService.getMergeRequests(projectId);

            return {
                success: true,
                count: mergeRequests.length,
                mergeRequests,
                message: 'Merge requests obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error('❌ Error obteniendo merge requests:', error.message);
            throw new HttpException(
                `Error obteniendo merge requests: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Crear un merge request
     * POST /gitlab/merge-requests
     */
    @Post('merge-requests')
    async createMergeRequest(@Body() createMergeRequestDto: CreateMergeRequestDto) {
        try {
            this.logger.log(`🔄 Creando merge request: ${createMergeRequestDto.title}...`);

            const mergeRequest = await this.gitlabService.createMergeRequest(createMergeRequestDto);

            return {
                success: true,
                mergeRequest,
                message: 'Merge request creado exitosamente'
            };

        } catch (error) {
            this.logger.error('❌ Error creando merge request:', error.message);
            throw new HttpException(
                `Error creando merge request: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // ==========================================
    // METADATOS Y USUARIOS
    // ==========================================

    /**
     * Obtener usuarios del proyecto
     * GET /gitlab/projects/:id/users
     */
    @Get('projects/:id/users')
    async getProjectUsers(@Param('id', ParseIntPipe) projectId: number) {
        try {
            this.logger.log(`👥 Obteniendo usuarios del proyecto ${projectId}...`);

            const users = await this.gitlabService.getProjectUsers(projectId);

            return {
                success: true,
                count: users.length,
                users,
                message: 'Usuarios obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error obteniendo usuarios del proyecto ${projectId}:`, error.message);
            throw new HttpException(
                `Error obteniendo usuarios: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Obtener branches del proyecto
     * GET /gitlab/projects/:id/branches
     */
    @Get('projects/:id/branches')
    async getBranches(@Param('id', ParseIntPipe) projectId: number) {
        try {
            this.logger.log(`🌿 Obteniendo branches del proyecto ${projectId}...`);

            const branches = await this.gitlabService.getBranches(projectId);

            return {
                success: true,
                count: branches.length,
                branches,
                message: 'Branches obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error obteniendo branches del proyecto ${projectId}:`, error.message);
            throw new HttpException(
                `Error obteniendo branches: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Obtener labels del proyecto
     * GET /gitlab/projects/:id/labels
     */
    @Get('projects/:id/labels')
    async getLabels(@Param('id', ParseIntPipe) projectId: number) {
        try {
            this.logger.log(`🏷️ Obteniendo labels del proyecto ${projectId}...`);

            const labels = await this.gitlabService.getLabels(projectId);

            return {
                success: true,
                count: labels.length,
                labels,
                message: 'Labels obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error obteniendo labels del proyecto ${projectId}:`, error.message);
            throw new HttpException(
                `Error obteniendo labels: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Obtener milestones del proyecto
     * GET /gitlab/projects/:id/milestones
     */
    @Get('projects/:id/milestones')
    async getMilestones(@Param('id', ParseIntPipe) projectId: number) {
        try {
            this.logger.log(`🎯 Obteniendo milestones del proyecto ${projectId}...`);

            const milestones = await this.gitlabService.getMilestones(projectId);

            return {
                success: true,
                count: milestones.length,
                milestones,
                message: 'Milestones obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error obteniendo milestones del proyecto ${projectId}:`, error.message);
            throw new HttpException(
                `Error obteniendo milestones: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Obtener pipelines del proyecto
     * GET /gitlab/projects/:id/pipelines
     */
    @Get('projects/:id/pipelines')
    async getPipelines(@Param('id', ParseIntPipe) projectId: number) {
        try {
            this.logger.log(`🚀 Obteniendo pipelines del proyecto ${projectId}...`);

            const pipelines = await this.gitlabService.getPipelines(projectId);

            return {
                success: true,
                count: pipelines.length,
                pipelines,
                message: 'Pipelines obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error obteniendo pipelines del proyecto ${projectId}:`, error.message);
            throw new HttpException(
                `Error obteniendo pipelines: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Obtener commits del proyecto
     * GET /gitlab/projects/:id/commits?ref_name=main
     */
    @Get('projects/:id/commits')
    async getCommits(
        @Param('id', ParseIntPipe) projectId: number,
        @Query('ref_name') refName?: string
    ) {
        try {
            this.logger.log(`📝 Obteniendo commits del proyecto ${projectId}...`);

            const commits = await this.gitlabService.getCommits(projectId, refName);

            return {
                success: true,
                count: commits.length,
                commits,
                ref_name: refName,
                message: 'Commits obtenidos exitosamente'
            };

        } catch (error) {
            this.logger.error(`❌ Error obteniendo commits del proyecto ${projectId}:`, error.message);
            throw new HttpException(
                `Error obteniendo commits: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }
}