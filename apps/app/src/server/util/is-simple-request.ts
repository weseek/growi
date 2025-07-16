import type { Request } from 'express';

import type { AccessTokenParserReq } from '~/server/middlewares/access-token-parser/interfaces';

const isSimpleRequest = (req: Request | AccessTokenParserReq): boolean => {
  // 1. Check if the request method is allowed
  const allowedMethods = ['GET', 'HEAD', 'POST'];
  if (!allowedMethods.includes(req.method)) {
    return false;
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
    'save-Data',
    'viewport-Width',
    'width',
  ];
  const nonSafeHeaders = Object.keys(req.headers).filter((header) => {
    const headerLower = header.toLowerCase();
    return !safeRequestHeaders.includes(headerLower);
  });

  if (nonSafeHeaders.length > 0) {
    return false;
  }

  // 3. Content-Type is
  const allowedContentTypes = [
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
  ];
  const contentType = req.headers['content-type'];

  if (contentType != null && !allowedContentTypes.includes(contentType.toLowerCase())) {
    return false;
  }
  // Return true if all conditions are met
  return true;
};

export default isSimpleRequest;
