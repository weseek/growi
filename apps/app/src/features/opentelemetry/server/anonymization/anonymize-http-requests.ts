import { diag } from '@opentelemetry/api';
import type { InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';

const logger = diag.createComponentLogger({ namespace: 'growi:anonymization:query' });

const ANONYMIZATION_CONFIG = {
  sensitiveParams: ['q', 'query', 'search', 'term', 'keyword'],
  maskPattern: '***',
};

export const httpInstrumentationConfig: InstrumentationConfigMap['@opentelemetry/instrumentation-http'] = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestHook: (span: any, request: any) => {
    try {
      // Anonymize from request URL
      const url = request.url || '';
      if (url.includes('?')) {
        const urlObj = new URL(url, 'http://localhost');
        let modified = false;
        ANONYMIZATION_CONFIG.sensitiveParams.forEach((param) => {
          if (urlObj.searchParams.has(param)) {
            urlObj.searchParams.set(param, ANONYMIZATION_CONFIG.maskPattern);
            modified = true;
          }
        });

        if (modified) {
          span.setAttribute('http.url', urlObj.toString());
          span.setAttribute('http.target', urlObj.pathname + urlObj.search);
          logger.debug('Anonymized search query parameters');
        }
      }
    }
    catch (error) {
      logger.error('Failed to anonymize request', { error });
    }
  },
};
