import { diag } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
import type { InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';

const logger = diag.createComponentLogger({ namespace: 'growi:anonymization:query' });

export interface AnonymizeHttpRequestsConfig {
  sensitiveParams: string[];
  maskPattern: string;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function anonymizeQueryString(query: string, config: AnonymizeHttpRequestsConfig): string {
  let result = query;

  config.sensitiveParams.forEach((param) => {
    // Match with (?:^|[?&])param=([^&]*) pattern
    const pattern = new RegExp(`((?:^|[?&])${escapeRegExp(param)}=)([^&]*)`, 'gi');
    result = result.replace(pattern, `$1${config.maskPattern}`);
  });

  return result;
}

function anonymizeUrl(url: string, config: AnonymizeHttpRequestsConfig): string {
  try {
    const urlObj = new URL(url);

    // Mask sensitive parameters
    let modified = false;
    config.sensitiveParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, config.maskPattern);
        modified = true;
      }
    });

    return modified ? urlObj.toString() : url;
  }
  catch (error) {
    // Fallback to regex if URL parsing fails
    return anonymizeQueryString(url, config);
  }
}

function anonymizeTarget(target: string, config: AnonymizeHttpRequestsConfig): string {
  // target is usually in the format "/path?query=value"
  const queryIndex = target.indexOf('?');
  if (queryIndex === -1) {
    return target; // No query parameters
  }

  const path = target.substring(0, queryIndex);
  const queryString = target.substring(queryIndex + 1);
  const anonymizedQuery = anonymizeQueryString(queryString, config);

  return `${path}?${anonymizedQuery}`;
}

function anonymizeHttpRequests(span: Span, config: AnonymizeHttpRequestsConfig): void {
  try {
    // When used in RequestHook, it's more reliable to anonymize from
    // request information rather than accessing the span directly
    // Here we check attributes directly and anonymize them

    // Check common HTTP attributes
    const httpUrlAttr = 'http.url';
    const urlQueryAttr = 'url.query';
    const httpTargetAttr = 'http.target';

    // Access to internal properties may be needed depending on span implementation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const internalSpan = span as any;
    const attributes = internalSpan.attributes || internalSpan._attributes || {};

    // Get http.url attribute
    const httpUrl = attributes[httpUrlAttr];
    if (typeof httpUrl === 'string') {
      const anonymizedUrl = anonymizeUrl(httpUrl, config);
      if (anonymizedUrl !== httpUrl) {
        span.setAttribute(httpUrlAttr, anonymizedUrl);
        logger.debug('Anonymized http.url attribute');
      }
    }

    // Get url.query attribute
    const urlQuery = attributes[urlQueryAttr];
    if (typeof urlQuery === 'string') {
      const anonymizedQuery = anonymizeQueryString(urlQuery, config);
      if (anonymizedQuery !== urlQuery) {
        span.setAttribute(urlQueryAttr, anonymizedQuery);
        logger.debug('Anonymized url.query attribute');
      }
    }

    // Get http.target attribute (path + query parameters)
    const httpTarget = attributes[httpTargetAttr];
    if (typeof httpTarget === 'string') {
      const anonymizedTarget = anonymizeTarget(httpTarget, config);
      if (anonymizedTarget !== httpTarget) {
        span.setAttribute(httpTargetAttr, anonymizedTarget);
        logger.debug('Anonymized http.target attribute');
      }
    }
  }
  catch (error) {
    logger.error('Failed to anonymize search queries', { error });
  }
}

export const httpInstrumentationConfig: InstrumentationConfigMap['@opentelemetry/instrumentation-http'] = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestHook: (span: any, request: any) => {
    try {
      // Anonymize search queries
      const anonymizationConfig = {
        enabled: true,
        sensitiveParams: ['q', 'query', 'search', 'term', 'keyword'],
        maskPattern: '***',
      };

      // Anonymize from request URL
      const url = request.url || '';
      if (url.includes('?')) {
        const urlObj = new URL(url, 'http://localhost');
        let modified = false;
        anonymizationConfig.sensitiveParams.forEach((param) => {
          if (urlObj.searchParams.has(param)) {
            urlObj.searchParams.set(param, anonymizationConfig.maskPattern);
            modified = true;
          }
        });

        if (modified) {
          span.setAttribute('http.url', urlObj.toString());
          span.setAttribute('http.target', urlObj.pathname + urlObj.search);
        }
      }
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to anonymize request:', error);
    }
  },
};
