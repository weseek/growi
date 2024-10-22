import type { Response, NextFunction } from 'express';
import { mock } from 'vitest-mock-extended';

import type Crowi from '~/server/crowi';
import type UserEvent from '~/server/events/user';

import type { AccessTokenParserReq } from './interfaces';

import { accessTokenParser } from '.';


// jest.mock('mongoose', () => ({
//   model: jest.fn().mockReturnValue({
//     findUserByApiToken: jest.fn(),
//   }),
// }));

// const mockUser = {
//   _id: 'userId',
//   username: 'testuser',
//   email: 'testuser@example.com',
// };


describe('access-token-parser middleware', () => {

  let User;

  beforeAll(async() => {
    const crowiMock = mock<Crowi>({
      event: vi.fn().mockImplementation((eventName) => {
        if (eventName === 'user') {
          return mock<UserEvent>({
            on: vi.fn(),
          });
        }
      }),
    });
    const userModelFactory = (await import('../../models/user')).default;
    User = userModelFactory(crowiMock);
  });

  it('should call next if no access token is provided', async() => {
    // arrange
    const reqMock = mock<AccessTokenParserReq>({
      user: undefined,
    });
    const resMock = mock<Response>();
    const nextMock = vi.fn();

    expect(reqMock.user).toBeUndefined();

    // act
    await accessTokenParser(reqMock, resMock, nextMock);

    // assert
    expect(reqMock.user).toBeUndefined();
    expect(nextMock).toHaveBeenCalled();
  });

  it('should call next if the given access token is invalid', async() => {
    // arrange
    const reqMock = mock<AccessTokenParserReq>({
      user: undefined,
    });
    const resMock = mock<Response>();
    const nextMock = vi.fn();

    expect(reqMock.user).toBeUndefined();

    // act
    reqMock.query.access_token = 'invalidToken';
    await accessTokenParser(reqMock, resMock, nextMock);

    // assert
    expect(reqMock.user).toBeUndefined();
    expect(nextMock).toHaveBeenCalled();
  });

  // it('should call next if access token is invalid', async() => {
  //   (mongoose.model().findUserByApiToken as jest.Mock).mockResolvedValue(null);
  //   req.query.access_token = 'invalidToken';
  //   await accessTokenParser(req as Request, res as Response, next);
  //   expect(next).toHaveBeenCalled();
  // });

  // it('should set req.user if access token is valid', async() => {
  //   (mongoose.model().findUserByApiToken as jest.Mock).mockResolvedValue(mockUser);
  //   req.query.access_token = 'validToken';
  //   await accessTokenParser(req as Request, res as Response, next);
  //   expect(req.user).toEqual(mockUser);
  //   expect(next).toHaveBeenCalled();
  // });
});
