import {
    IsString,
    IsOptional,
    IsArray,
    IsNumber,
    IsBoolean,
    IsEnum,
    IsDateString,
    MinLength,
    MaxLength,
    IsUrl
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO para crear un nuevo issue en GitLab
 */
export class CreateIssueDto {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    project_id?: number;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    labels?: string[];

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    assignee_id?: number;

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => parseInt(v)) : [])
    assignee_ids?: number[];

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    milestone_id?: number;

    @IsDateString()
    @IsOptional()
    due_date?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    confidential?: boolean;

    @IsEnum(['issue', 'incident', 'test_case', 'requirement', 'task'])
    @IsOptional()
    issue_type?: 'issue' | 'incident' | 'test_case' | 'requirement' | 'task';

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    weight?: number;
}

/**
 * DTO para actualizar un issue existente
 */
export class UpdateIssueDto {
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(255)
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    labels?: string[];

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    assignee_id?: number;

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => parseInt(v)) : [])
    assignee_ids?: number[];

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    milestone_id?: number;

    @IsDateString()
    @IsOptional()
    due_date?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    confidential?: boolean;

    @IsEnum(['opened', 'closed'])
    @IsOptional()
    state_event?: 'opened' | 'closed';

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    weight?: number;
}

/**
 * DTO para filtrar issues
 */
export class FilterIssuesDto {
    @IsEnum(['opened', 'closed', 'all'])
    @IsOptional()
    state?: 'opened' | 'closed' | 'all';

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    labels?: string[];

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    assignee_id?: number;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    author_id?: number;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    milestone_id?: number;

    @IsEnum(['created_at', 'updated_at', 'priority', 'due_date', 'relative_position', 'label_priority', 'milestone_due', 'popularity', 'weight'])
    @IsOptional()
    sort?: 'created_at' | 'updated_at' | 'priority' | 'due_date' | 'relative_position' | 'label_priority' | 'milestone_due' | 'popularity' | 'weight';

    @IsEnum(['asc', 'desc'])
    @IsOptional()
    order_by?: 'asc' | 'desc';

    @IsString()
    @IsOptional()
    search?: string;

    @IsDateString()
    @IsOptional()
    created_after?: string;

    @IsDateString()
    @IsOptional()
    created_before?: string;

    @IsDateString()
    @IsOptional()
    updated_after?: string;

    @IsDateString()
    @IsOptional()
    updated_before?: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    page?: number;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    per_page?: number;
}

/**
 * DTO para crear un merge request
 */
export class CreateMergeRequestDto {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    source_branch: string;

    @IsString()
    target_branch: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    project_id?: number;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    target_project_id?: number;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    labels?: string[];

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    assignee_id?: number;

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => parseInt(v)) : [])
    assignee_ids?: number[];

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => parseInt(v)) : [])
    reviewer_ids?: number[];

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    milestone_id?: number;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    remove_source_branch?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    squash?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    allow_collaboration?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    allow_maintainer_to_push?: boolean;
}

/**
 * DTO para crear un proyecto
 */
export class CreateProjectDto {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name: string;

    @IsString()
    @IsOptional()
    path?: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    namespace_id?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['private', 'internal', 'public'])
    @IsOptional()
    visibility?: 'private' | 'internal' | 'public';

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    issues_enabled?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    merge_requests_enabled?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    jobs_enabled?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    wiki_enabled?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    snippets_enabled?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    resolve_outdated_diff_discussions?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    container_registry_enabled?: boolean;

    @IsString()
    @IsOptional()
    default_branch?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tag_list?: string[];

    @IsUrl()
    @IsOptional()
    avatar?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    printing_merge_request_link_enabled?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    builds_enabled?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    public_builds?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    only_allow_merge_if_pipeline_succeeds?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    only_allow_merge_if_all_discussions_are_resolved?: boolean;

    @IsString()
    @IsOptional()
    merge_method?: 'merge' | 'rebase_merge' | 'ff';

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    lfs_enabled?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    request_access_enabled?: boolean;
}