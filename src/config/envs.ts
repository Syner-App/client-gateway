import 'dotenv/config';

import Joi from 'joi';

interface EnvVars {
    PORT: number;
    PRODUCTS_MICROSERVICE_HOST: string;
    PRODUCTS_MICROSERVICE_PORT: number;
    ORDERS_MICROSERVICE_HOST: string;
    ORDERS_MICROSERVICE_PORT: number;
    AUTH_MICROSERVICE_HOST: string;
    AUTH_MICROSERVICE_PORT: number;
    FINANCE_MICROSERVICE_HOST: string;
    FINANCE_MICROSERVICE_PORT: number;
}

const envsSchema = Joi.object({
    PORT: Joi.number().required(),
    PRODUCTS_MICROSERVICE_HOST: Joi.string().required(),
    PRODUCTS_MICROSERVICE_PORT: Joi.number().required(),
    ORDERS_MICROSERVICE_HOST: Joi.string().required(),
    ORDERS_MICROSERVICE_PORT: Joi.number().required(),
    AUTH_MICROSERVICE_HOST: Joi.string().required(),
    AUTH_MICROSERVICE_PORT: Joi.number().required(),
    FINANCE_MICROSERVICE_HOST: Joi.string().required(),
    FINANCE_MICROSERVICE_PORT: Joi.number().required(),
}).unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
     throw new Error(`Config validation error: ${ error }`);
}

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    productsMicroserviceHost: envVars.PRODUCTS_MICROSERVICE_HOST,
    productsMicroservicePort: envVars.PRODUCTS_MICROSERVICE_PORT,
    ordersMicroserviceHost: envVars.ORDERS_MICROSERVICE_HOST,
    ordersMicroservicePort: envVars.ORDERS_MICROSERVICE_PORT,
    authMicroserviceHost: envVars.AUTH_MICROSERVICE_HOST,
    authMicroservicePort: envVars.AUTH_MICROSERVICE_PORT,
    financeMicroserviceHost: envVars.FINANCE_MICROSERVICE_HOST,
    financeMicroservicePort: envVars.FINANCE_MICROSERVICE_PORT,
}
