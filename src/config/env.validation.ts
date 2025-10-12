import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    // Application Settings
    APP_NAME: Joi.string().default('API VirtualIT'),
    APP_VERSION: Joi.string().default('1.0.0'),

    // Server Configuration
    PORT: Joi.number().port().default(3000),
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    // // Database Configuration
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    // Database Configuration - New Sistemas (Read Only)
    DB_NEW_SISTEMAS_HOST: Joi.string().required(),
    DB_NEW_SISTEMAS_PORT: Joi.number().port().default(5432),
    DB_NEW_SISTEMAS_USERNAME: Joi.string().required(),
    DB_NEW_SISTEMAS_PASSWORD: Joi.string().required(),
    DB_NEW_SISTEMAS_NAME: Joi.string().required(),

    // New Sistemas Database Configuration (MariaDB)
    NEW_SISTEMAS_ENABLED: Joi.boolean().default(false),
    NEW_SISTEMAS_DB_TYPE: Joi.string().valid('mariadb', 'mysql').default('mysql'),
    NEW_SISTEMAS_DB_HOST: Joi.string().when('NEW_SISTEMAS_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
    NEW_SISTEMAS_DB_PORT: Joi.number().port().default(3306),
    NEW_SISTEMAS_DB_USERNAME: Joi.string().when('NEW_SISTEMAS_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
    NEW_SISTEMAS_DB_PASSWORD: Joi.string().allow('').default(''),
    NEW_SISTEMAS_DB_DATABASE: Joi.string().when('NEW_SISTEMAS_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
    NEW_SISTEMAS_DB_SCHEMA: Joi.string().default('public'),

    // GitLab API Configuration
    GITLAB_ENABLED: Joi.boolean().default(false),
    GITLAB_BASE_URL: Joi.string().uri().when('GITLAB_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
    GITLAB_ACCESS_TOKEN: Joi.string().when('GITLAB_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
    GITLAB_DEFAULT_PROJECT_ID: Joi.number().when('GITLAB_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),

    // // JWT Configuration
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().default('7d'),

    // // CORS Configuration
    CORS_ORIGIN: Joi.string().uri().required(),

    // // API Configuration
    API_PREFIX: Joi.string().default('api'),
});
