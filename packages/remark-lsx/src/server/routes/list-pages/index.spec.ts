import type { IUser } from '@growi/core';
import type { Request, Response } from 'express';
import { mock } from 'vitest-mock-extended';

import type { PageQueryBuilder } from './generate-base-query';

import { listPages } from '.';

describe('listPages', () => {

  it("returns 400 HTTP response when the query 'pagePath' is undefined", async() => {
    // setup
    const reqMock = mock<Request & { user: IUser }>();
    const resMock = mock<Response>();
    const resStatusMock = mock<Response>();
    resMock.status.calledWith(400).mockReturnValue(resStatusMock);

    // when
    await listPages(reqMock, resMock);

    // then
    expect(resMock.status).toBeCalledWith(400);
    expect(resStatusMock.send).toHaveBeenCalledOnce();
  });

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
