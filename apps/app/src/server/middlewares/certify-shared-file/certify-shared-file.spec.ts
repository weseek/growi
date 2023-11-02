import type { Response } from 'express';
import { mock } from 'vitest-mock-extended';

import { certifySharedFileMiddleware, type RequestToAllowShareLink } from './certify-shared-file';

const mocks = vi.hoisted(() => {
  return {
    validateRefererMock: vi.fn(),
  };
});

vi.mock('./validate-referer', () => ({ validateReferer: mocks.validateRefererMock }));


describe('certifySharedFileMiddleware', () => {

  const res = mock<Response>();
  const next = vi.fn();

  describe('should called next() without req.isSharedPage set', () => {

    it('when the fileId param is null', () => {
      // setup
      const req = mock<RequestToAllowShareLink>();
      req.params = {}; // id: undefined
      req.headers = {};

      // when
      certifySharedFileMiddleware(req, res, next);

      // then
      expect(mocks.validateRefererMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledOnce();
    });

    it('when validateReferer returns null', () => {
      // setup
      const req = mock<RequestToAllowShareLink>();
      req.params = { id: 'file id string' };
      req.headers = { referer: 'referer string' };

      // when
      certifySharedFileMiddleware(req, res, next);

      // then
      expect(mocks.validateRefererMock).toHaveBeenCalledOnce();
      expect(mocks.validateRefererMock).toHaveBeenCalledWith('referer string');
      expect(next).toHaveBeenCalledOnce();
    });

  });
});
