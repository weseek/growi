import { diag } from '@opentelemetry/api';

const logger = diag.createComponentLogger({ namespace: 'growi:anonymization:query-params' });

/**
 * Anonymize specific query parameters in HTTP target URL
 * @param target - The HTTP target URL with query parameters
 * @param paramNames - Array of parameter names to anonymize
 * @returns Anonymized HTTP target URL
 */
export function anonymizeQueryParams(target: string, paramNames: string[]): string {
  try {
    const url = new URL(target, 'http://localhost');
    const searchParams = new URLSearchParams(url.search);
    let hasAnonymization = false;

    // Anonymize each specified parameter if it exists
    for (const paramName of paramNames) {
      if (searchParams.has(paramName)) {
        const originalValue = searchParams.get(paramName);
        if (originalValue) {
          // Replace the parameter content with [ANONYMIZED] but keep the parameter structure
          searchParams.set(paramName, '[ANONYMIZED]');
          hasAnonymization = true;
          logger.debug(`Anonymized query parameter '${paramName}': original length=${originalValue.length}`);
        }
      }
    }

    if (!hasAnonymization) {
      return target; // No changes needed
    }

    // Reconstruct the target URL with anonymized parameters
    url.search = searchParams.toString();
    return url.pathname + url.search;
  }
  catch (error) {
    logger.warn(`Failed to anonymize query parameters [${paramNames.join(', ')}]: ${error}`);
    return target;
  }
}
