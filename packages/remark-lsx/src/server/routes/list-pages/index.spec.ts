import type { IUser } from '@growi/core';
import type { Request, Response } from 'express';
import { mock } from 'vitest-mock-extended';

import { listPages } from '.';

describe('listPages', () => {

  describe('with num option', () => {

    it('returns 500 HTTP response when an unexpected error occured', async() => {
      // setup
      const reqMock = mock<Request & { user: IUser }>();
      const resMock = mock<Response & { user: IUser }>();

      // when
      const response = await listPages(reqMock, resMock);

      // then
      expect(response).not.toBe(null);
    });

  });
});
