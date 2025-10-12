/**
 * Interfaces para la API de GitLab
 * 
 * Estas interfaces definen la estructura de datos para interactuar
 * con la API de GitLab v4
 */

export interface GitLabProject {
    id: number;
    name: string;
    name_with_namespace: string;
    path: string;
    path_with_namespace: string;
    description: string;
    default_branch: string;
    visibility: 'private' | 'internal' | 'public';
    ssh_url_to_repo: string;
    http_url_to_repo: string;
    web_url: string;
    created_at: string;
    updated_at: string;
    namespace: {
        id: number;
        name: string;
        path: string;
        kind: string;
        full_path: string;
    };
}

export interface GitLabIssue {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    description: string;
    state: 'opened' | 'closed';
    created_at: string;
    updated_at: string;
    closed_at?: string;
    closed_by?: GitLabUser;
    labels: string[];
    milestone?: GitLabMilestone;
    assignees: GitLabUser[];
    author: GitLabUser;
    assignee?: GitLabUser;
    user_notes_count: number;
    upvotes: number;
    downvotes: number;
    due_date?: string;
    confidential: boolean;
    discussion_locked: boolean;
    issue_type: 'issue' | 'incident' | 'test_case' | 'requirement' | 'task';
    web_url: string;
    time_stats: {
        time_estimate: number;
        total_time_spent: number;
        human_time_estimate?: string;
        human_total_time_spent?: string;
    };
    task_completion_status: {
        count: number;
        completed_count: number;
    };
    weight?: number;
    has_tasks: boolean;
    _links: {
        self: string;
        notes: string;
        award_emoji: string;
        project: string;
    };
}

export interface GitLabUser {
    id: number;
    username: string;
    name: string;
    state: 'active' | 'blocked' | 'deactivated';
    avatar_url: string;
    web_url: string;
    created_at: string;
    bio?: string;
    location?: string;
    public_email?: string;
    skype?: string;
    linkedin?: string;
    twitter?: string;
    website_url?: string;
    organization?: string;
}

export interface GitLabMilestone {
    id: number;
    title: string;
    description: string;
    state: 'active' | 'closed';
    created_at: string;
    updated_at: string;
    group_id?: number;
    project_id?: number;
    web_url: string;
    due_date?: string;
    start_date?: string;
}

export interface GitLabLabel {
    id: number;
    name: string;
    color: string;
    description?: string;
    description_html?: string;
    text_color: string;
    subscribed: boolean;
    priority?: number;
    is_project_label: boolean;
}

export interface GitLabMergeRequest {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    description: string;
    state: 'opened' | 'closed' | 'locked' | 'merged';
    created_at: string;
    updated_at: string;
    merged_by?: GitLabUser;
    merged_at?: string;
    closed_by?: GitLabUser;
    closed_at?: string;
    target_branch: string;
    source_branch: string;
    upvotes: number;
    downvotes: number;
    author: GitLabUser;
    assignee?: GitLabUser;
    assignees: GitLabUser[];
    reviewers: GitLabUser[];
    source_project_id: number;
    target_project_id: number;
    labels: string[];
    draft: boolean;
    work_in_progress: boolean;
    milestone?: GitLabMilestone;
    merge_when_pipeline_succeeds: boolean;
    merge_status: 'can_be_merged' | 'cannot_be_merged' | 'unchecked';
    detailed_merge_status: string;
    sha: string;
    merge_commit_sha?: string;
    squash_commit_sha?: string;
    user_notes_count: number;
    discussion_locked: boolean;
    should_remove_source_branch?: boolean;
    force_remove_source_branch?: boolean;
    allow_collaboration: boolean;
    allow_maintainer_to_push: boolean;
    web_url: string;
    references: {
        short: string;
        relative: string;
        full: string;
    };
    time_stats: {
        time_estimate: number;
        total_time_spent: number;
        human_time_estimate?: string;
        human_total_time_spent?: string;
    };
    squash: boolean;
    task_completion_status: {
        count: number;
        completed_count: number;
    };
    has_conflicts: boolean;
    blocking_discussions_resolved: boolean;
}

export interface GitLabCommit {
    id: string;
    short_id: string;
    title: string;
    author_name: string;
    author_email: string;
    authored_date: string;
    committer_name: string;
    committer_email: string;
    committed_date: string;
    created_at: string;
    message: string;
    parent_ids: string[];
    web_url: string;
}

export interface GitLabBranch {
    name: string;
    merged: boolean;
    protected: boolean;
    default: boolean;
    developers_can_push: boolean;
    developers_can_merge: boolean;
    can_push: boolean;
    commit: GitLabCommit;
}

export interface GitLabPipeline {
    id: number;
    iid: number;
    project_id: number;
    status: 'created' | 'waiting_for_resource' | 'preparing' | 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped' | 'manual' | 'scheduled';
    source: string;
    ref: string;
    sha: string;
    before_sha: string;
    tag: boolean;
    yaml_errors?: string;
    user: GitLabUser;
    created_at: string;
    updated_at: string;
    started_at?: string;
    finished_at?: string;
    committed_at?: string;
    duration?: number;
    queued_duration?: number;
    coverage?: string;
    web_url: string;
}

export interface GitLabApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

export interface GitLabApiError {
    error: string;
    error_description?: string;
    message?: string | string[];
}

export interface GitLabConfig {
    baseUrl: string;
    accessToken: string;
    defaultProjectId?: number;
    timeout?: number;
    enabled: boolean;
}