import { Logger } from '@ddboot/log4js';

export const PrismaUpdateOptionMiddleware = async (params, next) => {
  const { action, args } = params;
  if (action === 'update') {
    const { data } = args || {};
    data.updated_at = new Date().toISOString();
  }
  const result = await next(params);
  return result;
};

export const PrismaPerformanceLogMiddleware = (log: Logger) => {
  return async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    log.info(
      `[prisma:query] ${params.model}.${params.action} took ${
        after - before
      }ms`,
    );
    return result;
  };
};
