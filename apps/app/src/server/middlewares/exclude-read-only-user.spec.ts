import { ErrorV3 } from '@growi/core';

import { excludeReadOnlyUser } from './exclude-read-only-user';

describe('excludeReadOnlyUser', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: {},
    };
    res = {
      apiv3Err: vi.fn(),
    };
    next = vi.fn();
  });

  test('should call next if user is not found', () => {
    req.user = null;

    excludeReadOnlyUser(req, res, next);

    expect(next).toBeCalled();
    expect(res.apiv3Err).not.toBeCalled();
  });

  test('should call next if user is not read only', () => {
    req.user.readOnly = false;

    excludeReadOnlyUser(req, res, next);

    expect(next).toBeCalled();
    expect(res.apiv3Err).not.toBeCalled();
  });

  test('should return error response if user is read only', () => {
    req.user.readOnly = true;

    excludeReadOnlyUser(req, res, next);

    expect(next).not.toBeCalled();
    expect(res.apiv3Err).toBeCalledWith(
      new ErrorV3('This user is read only user', 'validatioin_failed'),
    );
  });
});
