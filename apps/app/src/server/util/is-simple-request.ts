import type { Request } from 'express';

import type { AccessTokenParserReq } from '~/server/middlewares/access-token-parser/interfaces';

// 1. Check if the request method is allowed
const allowedMethods = ['GET', 'HEAD', 'POST'] as const;
type AllowedMethod = typeof allowedMethods[number];
function isAllowedMethod(method: string): method is AllowedMethod {
  return allowedMethods.includes(method as AllowedMethod);
}

// 2. Check if the request headers are safe
const safeRequestHeaders = [
  'accept',
  'accept-language',
  'content-language',
  'content-type',
  'range',
  'referer',
  'dpr',
  'downlink',
  'save-data',
  'viewport-width',
  'width',
] as const;
type SafeRequestHeader = typeof safeRequestHeaders[number];

// 3. Content-Type is
const allowedContentTypes = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
] as const;
type AllowedContentType = typeof allowedContentTypes[number];

const isSimpleRequest = (req: Request | AccessTokenParserReq): boolean => {
  if (!isAllowedMethod(req.method)) {
    return false;
  }

  const nonSafeHeaders = Object.keys(req.headers).filter((header) => {
    const headerLower = header.toLowerCase();
    return !safeRequestHeaders.includes(headerLower as SafeRequestHeader);
  });

  if (nonSafeHeaders.length > 0) {
    return false;
  }

  const contentType = req.headers['content-type'];
  if (contentType != null && !allowedContentTypes.includes(contentType.toLowerCase() as AllowedContentType)) {
    return false;
  }

  // Return true if all conditions are met
  return true;
};

export default isSimpleRequest;
