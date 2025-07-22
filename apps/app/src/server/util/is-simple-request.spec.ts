import type { Request } from 'express';

import isSimpleRequest from '~/server/util/is-simple-request';

const { Headers } = globalThis;
const createRequest = ({ headers, method = 'GET', contentType }: { headers?: Headers, method?: string, contentType?: string }) => {
  const plainHeaders: Record<string, string> = {};
  if (headers) {
    headers.forEach((value, name) => {
      plainHeaders[name] = value;
    });
  }
  if (contentType) {
    plainHeaders['content-type'] = contentType;
  }

  return {
    method,
    headers: plainHeaders,
  } as Request;
};

describe('isSimpleRequest', () => {


  // method
  describe('When request method is checked', () => {

    // allow
    describe('When allowed method is given', () => {
      const allowedMethods = ['GET', 'HEAD', 'POST'];
      it.each(allowedMethods)('returns true for %s method', (method) => {
        const req = createRequest({ method });
        expect(isSimpleRequest(req)).toBe(true);
      });
    });

    // disallow
    describe('When disallowed method is given', () => {
      const disallowedMethods = ['PUT', 'DELETE', 'PATCH', 'OPTIONS', 'TRACE'];

      it.each(disallowedMethods)('returns false for %s method', (method) => {
        const req = createRequest({ method });
        expect(isSimpleRequest(req)).toBe(false);
      });
    });

  });


  // headers
  describe('When request headers are checked', () => {

    // allow(Other than content-type)
    describe('When only safe headers are given', () => {
      const safeHeaders = [
        'accept',
        'accept-language',
        'content-language',
        'range',
        'referer',
        'dpr',
        'downlink',
        'save-data',
        'viewport-width',
        'width',
      ];
      it.each(safeHeaders)('returns true for safe header: %s', (headerName) => {
        const headers = new Headers();
        headers.set(headerName, 'test-value');
        const req = createRequest({ headers });
        expect(isSimpleRequest(req)).toBe(true);
      });
      // content-type
      it('returns true for valid content-type values', () => {
        const validContentTypes = [
          'application/x-www-form-urlencoded',
          'multipart/form-data',
          'text/plain',
        ];
        validContentTypes.forEach((contentType) => {
          const headers = new Headers();
          headers.set('content-type', contentType);
          const req = createRequest({ headers });
          expect(isSimpleRequest(req)).toBe(true);
        });
      });
      // combination
      it('returns true for combination of safe headers', () => {
        const headers = new Headers();
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'text/plain');
        headers.set('Accept-Language', 'en-US');
        const req = createRequest({ headers });
        expect(isSimpleRequest(req)).toBe(true);
      });
    });

    // disallow
    describe('When unsafe headers are given', () => {
      const unsafeHeaders = [
        'X-Custom-Header',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
      ];
      it.each(unsafeHeaders)('returns false for unsafe header: %s', (headerName) => {
        const headers = new Headers();
        headers.set(headerName, 'test-value');
        const req = createRequest({ headers });
        expect(isSimpleRequest(req)).toBe(false);
      });
      // combination
      it('returns false when safe and unsafe headers are mixed', () => {
        const headers = new Headers();
        headers.set('Accept', 'application/json'); // Safe
        headers.set('X-Custom-Header', 'custom-value'); // Unsafe
        const req = createRequest({ headers });
        expect(isSimpleRequest(req)).toBe(false);
      });
    });

  });


  // content-type
  describe('When content-type is checked', () => {

    // allow
    describe('When a safe content-type is given', () => {
      const safeContentTypes = [
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain',
      ];
      it.each(safeContentTypes)('returns true for %s', (contentType) => {
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        const req = createRequest({ headers });
        expect(isSimpleRequest(req)).toBe(true);
      });
    });
    // parameters
    describe('When content-type has parameters', () => {
      const contentTypesWithParams = [
        'application/x-www-form-urlencoded; charset=UTF-8',
        'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        'text/plain; charset=iso-8859-1',
      ];
      it.each(contentTypesWithParams)('returns true for %s', (contentType) => {
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        const req = createRequest({ headers });
        expect(isSimpleRequest(req)).toBe(true);
      });
    });
    // absent
    describe('When content-type is absent', () => {
      it('returns true when no content-type header is set', () => {
        const headers = new Headers();
        const req = createRequest({ headers });
        expect(isSimpleRequest(req)).toBe(true);
      });
    });

    // disallow
    describe('When disallowed content-type is given', () => {
      const disallowedContentTypes = [
        'application/json',
        'application/xml',
        'text/html',
        'application/octet-stream',
      ];
      it.each(disallowedContentTypes)('returns false for %s', (contentType) => {
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        const req = createRequest({ headers });
        expect(isSimpleRequest(req)).toBe(false);
      });
    });

  });


  // integration
  describe('When multiple conditions are checked', () => {

    describe('When all conditions are met', () => {
      const headers = new Headers();
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
      it('returns true', () => {
        const req = createRequest({ method: 'POST', headers });
        expect(isSimpleRequest(req)).toBe(true);
      });
    });

    describe('When method is disallowed but headers are safe', () => {
      const headers = new Headers();
      headers.set('Content-Type', 'text/plain');
      it('returns false', () => {
        const req = createRequest({ method: 'PUT', headers });
        expect(isSimpleRequest(req)).toBe(false);
      });
    });

    describe('When method is allowed but headers are non-safe', () => {
      const headers = new Headers();
      headers.set('X-Custom-Header', 'custom-value');
      it('returns false', () => {
        const req = createRequest({ method: 'POST', headers });
        expect(isSimpleRequest(req)).toBe(false);
      });
    });
  });
});
