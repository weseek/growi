import loggerFactory from '~/utils/logger';

import type { CommonEachProps } from '../common-props';
import { isValidCommonEachRouteProps } from '../common-props';

import type { GeneralPageInitialProps } from './types';

const logger = loggerFactory('growi:pages:general-page:type-guards');

/**
 * Type guard for GeneralPageInitialProps & CommonEachProps validation
 * First validates CommonEachProps, then checks GeneralPageGeneralPageInitialProps-specific properties
 */
export function isValidInitialAndSameRouteProps(props: unknown): props is GeneralPageInitialProps & CommonEachProps {
  // First, validate CommonEachProps
  if (!isValidCommonEachRouteProps(props)) {
    logger.warn('isValidInitialAndSameRouteProps: CommonEachProps validation failed');
    return false;
  }

  const p = props as Record<string, unknown>;

  // Then validate GeneralPageInitialProps-specific properties
  // CommonPageInitialProps
  if (p.isNextjsRoutingTypeInitial !== true) {
    logger.warn('isValidInitialAndSameRouteProps: isNextjsRoutingTypeInitial is not true', { isNextjsRoutingTypeInitial: p.isNextjsRoutingTypeInitial });
    return false;
  }
  if (typeof p.growiVersion !== 'string') {
    logger.warn('isValidInitialAndSameRouteProps: growiVersion is not a string', { growiVersion: p.growiVersion });
    return false;
  }

  // GeneralPageInitialProps specific page state
  if (typeof p.isNotFound !== 'boolean') {
    logger.warn('isValidInitialAndSameRouteProps: isNotFound is not a boolean', { isNotFound: p.isNotFound });
    return false;
  }
  if (typeof p.isForbidden !== 'boolean') {
    logger.warn('isValidInitialAndSameRouteProps: isForbidden is not a boolean', { isForbidden: p.isForbidden });
    return false;
  }
  if (typeof p.isNotCreatable !== 'boolean') {
    logger.warn('isValidInitialAndSameRouteProps: isNotCreatable is not a boolean', { isNotCreatable: p.isNotCreatable });
    return false;
  }

  return true;
}
