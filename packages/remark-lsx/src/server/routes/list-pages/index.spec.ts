import { IPage, IUser } from '@growi/core';
import type { Request, Response } from 'express';
import createError from 'http-errors';
import type { Query, Document } from 'mongoose';
import { mock } from 'vitest-mock-extended';

import { listPages } from '.';


// mocking modules
const mocks = vi.hoisted(() => {
  return {
    addNumConditionMock: vi.fn(),
    addSortConditionMock: vi.fn(),
    generateBaseQueryMock: vi.fn(),
    getToppageViewersCountMock: vi.fn(),
  };
});

vi.mock('./add-num-condition', () => ({ addNumCondition: mocks.addNumConditionMock }));
vi.mock('./add-sort-condition', () => ({ addSortCondition: mocks.addSortConditionMock }));
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
    expect(resMock.status).toHaveBeenCalledOnce();
    expect(resStatusMock.send).toHaveBeenCalledOnce();
    expect(mocks.generateBaseQueryMock).not.toHaveBeenCalled();
  });

  describe('with num option', () => {

    mocks.generateBaseQueryMock.mockImplementation(() => vi.fn());
    mocks.getToppageViewersCountMock.mockImplementation(() => 99);

    it('returns 200 HTTP response', async() => {
      // setup
      const reqMock = mock<Request & { user: IUser }>();
      reqMock.query = { pagePath: '/Sandbox' };

      const pageMock = mock<IPage>();
      const queryMock = mock<Query<IPage[], Document>>();
      queryMock.exec.mockImplementation(async() => [pageMock]);
      mocks.addSortConditionMock.mockImplementation(() => queryMock);

      const resMock = mock<Response>();
      const resStatusMock = mock<Response>();
      resMock.status.calledWith(200).mockReturnValue(resStatusMock);

      // when
      await listPages(reqMock, resMock);

      // then
      expect(mocks.generateBaseQueryMock).toHaveBeenCalledOnce();
      expect(mocks.getToppageViewersCountMock).toHaveBeenCalledOnce();
      expect(mocks.addNumConditionMock).toHaveBeenCalledOnce();
      expect(mocks.addSortConditionMock).toHaveBeenCalledOnce();
      expect(resMock.status).toHaveBeenCalledOnce();
      expect(resStatusMock.send).toHaveBeenCalledWith({
        pages: [pageMock],
        toppageViewersCount: 99,
      });
    });

    it('returns 500 HTTP response when an unexpected error occured', async() => {
      // setup
      const reqMock = mock<Request & { user: IUser }>();
      reqMock.query = { pagePath: '/Sandbox' };

      // an Error instance will be thrown by addNumConditionMock
      const expectedError = new Error('error for test');
      mocks.addNumConditionMock.mockImplementation(() => {
        throw expectedError;
      });

      const resMock = mock<Response>();
      const resStatusMock = mock<Response>();
      resMock.status.calledWith(500).mockReturnValue(resStatusMock);

      // when
      await listPages(reqMock, resMock);

      // then
      expect(mocks.generateBaseQueryMock).toHaveBeenCalledOnce();
      expect(mocks.getToppageViewersCountMock).toHaveBeenCalledOnce();
      expect(mocks.addNumConditionMock).toHaveBeenCalledOnce(); // throw an error
      expect(mocks.addSortConditionMock).not.toHaveBeenCalledOnce(); // does not called
      expect(resMock.status).toHaveBeenCalledOnce();
      expect(resStatusMock.send).toHaveBeenCalledWith(expectedError);
    });

    it('returns 400 HTTP response when the value is invalid', async() => {
      // setup
      const reqMock = mock<Request & { user: IUser }>();
      reqMock.query = { pagePath: '/Sandbox' };

      // an http-errors instance will be thrown by addNumConditionMock
      const expectedError = createError(400, 'error for test');
      mocks.addNumConditionMock.mockImplementation(() => {
        throw expectedError;
      });

      const resMock = mock<Response>();
      const resStatusMock = mock<Response>();
      resMock.status.calledWith(400).mockReturnValue(resStatusMock);

      // when
      await listPages(reqMock, resMock);

      // then
      expect(mocks.generateBaseQueryMock).toHaveBeenCalledOnce();
      expect(mocks.getToppageViewersCountMock).toHaveBeenCalledOnce();
      expect(mocks.addNumConditionMock).toHaveBeenCalledOnce(); // throw an error
      expect(mocks.addSortConditionMock).not.toHaveBeenCalledOnce(); // does not called
      expect(resMock.status).toHaveBeenCalledOnce();
      expect(resStatusMock.send).toHaveBeenCalledWith(expectedError);
    });

  });
});
