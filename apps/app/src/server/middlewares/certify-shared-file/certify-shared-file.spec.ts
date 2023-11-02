import type { Response } from 'express';
import { mock } from 'vitest-mock-extended';

import { certifySharedFileMiddleware, type RequestToAllowShareLink } from './certify-shared-file';
import { ValidReferer } from './interfaces';

const mocks = vi.hoisted(() => {
  return {
    validateRefererMock: vi.fn(),
    retrieveValidShareLinkByRefererMock: vi.fn(),
  };
});

vi.mock('./validate-referer', () => ({ validateReferer: mocks.validateRefererMock }));
vi.mock('./retrieve-valid-share-link', () => ({ retrieveValidShareLinkByReferer: mocks.retrieveValidShareLinkByRefererMock }));


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

    it('when retrieveValidShareLinkByReferer returns null', async() => {
      // setup
      const req = mock<RequestToAllowShareLink>();
      req.params = { id: 'file id string' };
      req.headers = { referer: 'referer string' };

      const validReferer: ValidReferer = {
        referer: 'referer string',
        shareLinkId: 'ffffffffffffffffffffffff',
      };
      mocks.validateRefererMock.mockImplementation(() => validReferer);

      mocks.retrieveValidShareLinkByRefererMock.mockResolvedValue(null);

      // when
      await certifySharedFileMiddleware(req, res, next);

      // then
      expect(mocks.validateRefererMock).toHaveBeenCalledOnce();
      expect(mocks.validateRefererMock).toHaveBeenCalledWith('referer string');
      expect(mocks.retrieveValidShareLinkByRefererMock).toHaveBeenCalledOnce();
      expect(mocks.retrieveValidShareLinkByRefererMock).toHaveBeenCalledWith(validReferer);
      expect(next).toHaveBeenCalledOnce();
    });

  });
});
