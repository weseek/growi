import { registerOTel } from '@vercel/otel';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:instrumentation');

logger.info('HOGEhoge');

export function register(): void {
  registerOTel({ serviceName: 'growi' });
}
