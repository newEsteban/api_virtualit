import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Definimos tipos simples para axios
type AxiosInstance = any;
type AxiosResponse<T = any> = {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
};
import {
    GitLabProject,
    GitLabIssue,
    GitLabUser,
    GitLabMergeRequest,
    GitLabBranch,
    GitLabCommit,
    GitLabPipeline,
    GitLabLabel,
    GitLabMilestone,
    GitLabApiError,
    GitLabConfig
} from '../interfaces/gitlab.interface';
import {
    CreateIssueDto,
    UpdateIssueDto,
    FilterIssuesDto,
    CreateMergeRequestDto,
    CreateProjectDto
} from '../dto/gitlab.dto';

/**
 * Servicio principal para interactuar con la API de GitLab
 * 
 * Proporciona métodos para manejar proyectos, issues, merge requests,
 * usuarios, branches, commits, pipelines, labels y milestones.
 */
@Injectable()
export class GitLabService {
    private readonly logger = new Logger(GitLabService.name);
    private readonly axiosInstance: AxiosInstance;
    private readonly config: GitLabConfig;
    private readonly isEnabled: boolean;

    constructor(private readonly configService: ConfigService) {
        this.isEnabled = this.configService.get<boolean>('GITLAB_ENABLED', false);

        if (!this.isEnabled) {
            this.logger.warn('🔒 GitLab API deshabilitada (GITLAB_ENABLED=false)');
            return;
        }

        this.config = {
            baseUrl: this.configService.get<string>('GITLAB_BASE_URL') || '',
            accessToken: this.configService.get<string>('GITLAB_ACCESS_TOKEN') || '',
            defaultProjectId: this.configService.get<number>('GITLAB_DEFAULT_PROJECT_ID'),
            timeout: 10000,
            enabled: this.isEnabled
        };

        this.axiosInstance = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: {
                'Authorization': `Bearer ${this.config.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Interceptor para logging de requests
        this.axiosInstance.interceptors.request.use(
            (config) => {
                this.logger.debug(`🌐 GitLab API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                this.logger.error('❌ GitLab API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Interceptor para logging de responses
        this.axiosInstance.interceptors.response.use(
            (response) => {
                this.logger.debug(`✅ GitLab API Response: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                const status = error.response?.status || 'Unknown';
                const message = error.response?.data?.message || error.message;
                this.logger.error(`❌ GitLab API Error: ${status} - ${message}`);
                return Promise.reject(error);
            }
        );

        this.logger.log('🔓 GitLab API habilitada y configurada correctamente');
    }

    /**
     * Verificar si GitLab está habilitado y configurado
     */
    private checkGitLabEnabled(): void {
        if (!this.isEnabled) {
            throw new Error(
                '🔒 GitLab API deshabilitada. ' +
                'Para usar GitLab, configura GITLAB_ENABLED=true en el archivo .env ' +
                'y proporciona las credenciales necesarias.'
            );
        }
    }

    /**
     * Manejar errores de la API de GitLab
     */
    private handleApiError(error: any, operation: string): never {
        const gitlabError: GitLabApiError = {
            error: error.response?.data?.error || 'Unknown Error',
            error_description: error.response?.data?.error_description,
            message: error.response?.data?.message || error.message
        };

        this.logger.error(`❌ Error en ${operation}:`, gitlabError);
        throw new Error(`GitLab API Error en ${operation}: ${gitlabError.message || gitlabError.error}`);
    }

    // ==========================================
    // PROYECTOS
    // ==========================================

    /**
     * Obtener todos los proyectos accesibles
     */
    async getProjects(): Promise<GitLabProject[]> {
        try {
            this.checkGitLabEnabled();

            const response: AxiosResponse<GitLabProject[]> = await this.axiosInstance.get('/projects');

            this.logger.log(`📁 Obtenidos ${response.data.length} proyectos de GitLab`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener proyectos');
        }
    }

    /**
     * Obtener un proyecto específico por ID
     */
    async getProject(projectId: number): Promise<GitLabProject> {
        try {
            this.checkGitLabEnabled();

            const response: AxiosResponse<GitLabProject> = await this.axiosInstance.get(`/projects/${projectId}`);

            this.logger.log(`📁 Obtenido proyecto: ${response.data.name} (ID: ${projectId})`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, `obtener proyecto ${projectId}`);
        }
    }

    /**
     * Crear un nuevo proyecto
     */
    async createProject(createProjectDto: CreateProjectDto): Promise<GitLabProject> {
        try {
            this.checkGitLabEnabled();

            const response: AxiosResponse<GitLabProject> = await this.axiosInstance.post('/projects', createProjectDto);

            this.logger.log(`✅ Proyecto creado: ${response.data.name} (ID: ${response.data.id})`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'crear proyecto');
        }
    }

    // ==========================================
    // ISSUES
    // ==========================================

    /**
     * Obtener issues con filtros opcionales
     */
    async getIssues(projectId?: number, filters?: FilterIssuesDto): Promise<GitLabIssue[]> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (Array.isArray(value)) {
                            value.forEach(v => params.append(key, v.toString()));
                        } else {
                            params.append(key, value.toString());
                        }
                    }
                });
            }

            const url = `/projects/${targetProjectId}/issues${params.toString() ? `?${params.toString()}` : ''}`;
            const response: AxiosResponse<GitLabIssue[]> = await this.axiosInstance.get(url);

            this.logger.log(`🎫 Obtenidos ${response.data.length} issues del proyecto ${targetProjectId}`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener issues');
        }
    }

    /**
     * Obtener un issue específico
     */
    async getIssue(issueIid: number, projectId?: number): Promise<GitLabIssue> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const response: AxiosResponse<GitLabIssue> = await this.axiosInstance.get(
                `/projects/${targetProjectId}/issues/${issueIid}`
            );

            this.logger.log(`🎫 Obtenido issue: ${response.data.title} (IID: ${issueIid})`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, `obtener issue ${issueIid}`);
        }
    }

    /**
     * Crear un nuevo issue
     */
    async createIssue(createIssueDto: CreateIssueDto): Promise<GitLabIssue> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = createIssueDto.project_id || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const issueData = { ...createIssueDto };
            delete issueData.project_id; // No enviar project_id en el body

            const response: AxiosResponse<GitLabIssue> = await this.axiosInstance.post(
                `/projects/${targetProjectId}/issues`,
                issueData
            );

            this.logger.log(`✅ Issue creado: ${response.data.title} (IID: ${response.data.iid})`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'crear issue');
        }
    }

    /**
     * Actualizar un issue existente
     */
    async updateIssue(issueIid: number, updateIssueDto: UpdateIssueDto, projectId?: number): Promise<GitLabIssue> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const response: AxiosResponse<GitLabIssue> = await this.axiosInstance.put(
                `/projects/${targetProjectId}/issues/${issueIid}`,
                updateIssueDto
            );

            this.logger.log(`✅ Issue actualizado: ${response.data.title} (IID: ${issueIid})`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, `actualizar issue ${issueIid}`);
        }
    }

    /**
     * Cerrar un issue
     */
    async closeIssue(issueIid: number, projectId?: number): Promise<GitLabIssue> {
        return this.updateIssue(issueIid, { state_event: 'closed' }, projectId);
    }

    /**
     * Reabrir un issue
     */
    async reopenIssue(issueIid: number, projectId?: number): Promise<GitLabIssue> {
        return this.updateIssue(issueIid, { state_event: 'opened' }, projectId);
    }

    // ==========================================
    // MERGE REQUESTS
    // ==========================================

    /**
     * Obtener merge requests de un proyecto
     */
    async getMergeRequests(projectId?: number): Promise<GitLabMergeRequest[]> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const response: AxiosResponse<GitLabMergeRequest[]> = await this.axiosInstance.get(
                `/projects/${targetProjectId}/merge_requests`
            );

            this.logger.log(`🔄 Obtenidos ${response.data.length} merge requests del proyecto ${targetProjectId}`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener merge requests');
        }
    }

    /**
     * Crear un nuevo merge request
     */
    async createMergeRequest(createMergeRequestDto: CreateMergeRequestDto): Promise<GitLabMergeRequest> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = createMergeRequestDto.project_id || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const mrData = { ...createMergeRequestDto };
            delete mrData.project_id; // No enviar project_id en el body

            const response: AxiosResponse<GitLabMergeRequest> = await this.axiosInstance.post(
                `/projects/${targetProjectId}/merge_requests`,
                mrData
            );

            this.logger.log(`✅ Merge Request creado: ${response.data.title} (IID: ${response.data.iid})`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'crear merge request');
        }
    }

    // ==========================================
    // USUARIOS
    // ==========================================

    /**
     * Obtener usuarios del proyecto
     */
    async getProjectUsers(projectId?: number): Promise<GitLabUser[]> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const response: AxiosResponse<GitLabUser[]> = await this.axiosInstance.get(
                `/projects/${targetProjectId}/users`
            );

            this.logger.log(`👥 Obtenidos ${response.data.length} usuarios del proyecto ${targetProjectId}`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener usuarios del proyecto');
        }
    }

    /**
     * Obtener usuario actual
     */
    async getCurrentUser(): Promise<GitLabUser> {
        try {
            this.checkGitLabEnabled();

            const response: AxiosResponse<GitLabUser> = await this.axiosInstance.get('/user');

            this.logger.log(`👤 Usuario actual: ${response.data.name} (@${response.data.username})`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener usuario actual');
        }
    }

    // ==========================================
    // BRANCHES
    // ==========================================

    /**
     * Obtener branches de un proyecto
     */
    async getBranches(projectId?: number): Promise<GitLabBranch[]> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const response: AxiosResponse<GitLabBranch[]> = await this.axiosInstance.get(
                `/projects/${targetProjectId}/repository/branches`
            );

            this.logger.log(`🌿 Obtenidos ${response.data.length} branches del proyecto ${targetProjectId}`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener branches');
        }
    }

    // ==========================================
    // LABELS
    // ==========================================

    /**
     * Obtener labels de un proyecto
     */
    async getLabels(projectId?: number): Promise<GitLabLabel[]> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const response: AxiosResponse<GitLabLabel[]> = await this.axiosInstance.get(
                `/projects/${targetProjectId}/labels`
            );

            this.logger.log(`🏷️ Obtenidos ${response.data.length} labels del proyecto ${targetProjectId}`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener labels');
        }
    }

    // ==========================================
    // MILESTONES
    // ==========================================

    /**
     * Obtener milestones de un proyecto
     */
    async getMilestones(projectId?: number): Promise<GitLabMilestone[]> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const response: AxiosResponse<GitLabMilestone[]> = await this.axiosInstance.get(
                `/projects/${targetProjectId}/milestones`
            );

            this.logger.log(`🎯 Obtenidos ${response.data.length} milestones del proyecto ${targetProjectId}`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener milestones');
        }
    }

    // ==========================================
    // PIPELINES
    // ==========================================

    /**
     * Obtener pipelines de un proyecto
     */
    async getPipelines(projectId?: number): Promise<GitLabPipeline[]> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const response: AxiosResponse<GitLabPipeline[]> = await this.axiosInstance.get(
                `/projects/${targetProjectId}/pipelines`
            );

            this.logger.log(`🚀 Obtenidos ${response.data.length} pipelines del proyecto ${targetProjectId}`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener pipelines');
        }
    }

    // ==========================================
    // COMMITS
    // ==========================================

    /**
     * Obtener commits de un proyecto
     */
    async getCommits(projectId?: number, ref_name?: string): Promise<GitLabCommit[]> {
        try {
            this.checkGitLabEnabled();

            const targetProjectId = projectId || this.config.defaultProjectId;
            if (!targetProjectId) {
                throw new Error('No se especificó project_id y no hay un proyecto por defecto configurado');
            }

            const params = ref_name ? `?ref_name=${ref_name}` : '';
            const response: AxiosResponse<GitLabCommit[]> = await this.axiosInstance.get(
                `/projects/${targetProjectId}/repository/commits${params}`
            );

            this.logger.log(`📝 Obtenidos ${response.data.length} commits del proyecto ${targetProjectId}`);
            return response.data;
        } catch (error) {
            this.handleApiError(error, 'obtener commits');
        }
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    /**
     * Verificar conectividad con GitLab
     */
    async testConnection(): Promise<{ success: boolean; user?: GitLabUser; error?: string }> {
        try {
            this.checkGitLabEnabled();

            const user = await this.getCurrentUser();

            return {
                success: true,
                user
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtener estadísticas del servicio
     */
    getServiceStats(): {
        enabled: boolean;
        baseUrl?: string;
        defaultProjectId?: number;
        hasToken: boolean;
    } {
        return {
            enabled: this.isEnabled,
            baseUrl: this.config?.baseUrl,
            defaultProjectId: this.config?.defaultProjectId,
            hasToken: !!this.config?.accessToken
        };
    }
}