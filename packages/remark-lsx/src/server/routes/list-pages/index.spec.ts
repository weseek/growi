import type { IUser } from '@growi/core';
import type { Request, Response } from 'express';
import { mock } from 'vitest-mock-extended';

import type { PageQueryBuilder } from './generate-base-query';

import { listPages } from '.';


// mocking modules
const mocks = vi.hoisted(() => {
  return {
    generateBaseQueryMock: vi.fn(),
    getToppageViewersCountMock: vi.fn(),
  };
});

vi.mock('./generate-base-query', () => ({ generateBaseQuery: mocks.generateBaseQueryMock }));
vi.mock('./get-toppage-viewers-count', () => ({ getToppageViewersCount: mocks.getToppageViewersCountMock }));


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
      const builderMock = mock<PageQueryBuilder>();
      mocks.generateBaseQueryMock.mockImplementation(() => builderMock);

      const reqMock = mock<Request & { user: IUser }>();
      reqMock.query = { pagePath: '/Sandbox' };
      const resMock = mock<Response>();
      const resStatusMock = mock<Response>();
      resMock.status.calledWith(500).mockReturnValue(resStatusMock);

      // when
      await listPages(reqMock, resMock);

      // then
      expect(resMock.status).toBeCalledWith(500);
      expect(resStatusMock.send).toHaveBeenCalledOnce();
    });

  });
});
