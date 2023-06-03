import { IPage, IUser } from '@growi/core';
import type { Request, Response } from 'express';
import createError from 'http-errors';
import { mock } from 'vitest-mock-extended';

import { LsxApiResponseData } from '../../../interfaces/api';

import type { PageQuery } from './generate-base-query';

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

    beforeAll(() => {
      mocks.generateBaseQueryMock.mockImplementation(() => vi.fn());
      mocks.getToppageViewersCountMock.mockImplementation(() => 99);
    });

    it('returns 200 HTTP response', async() => {
      // setup
      const reqMock = mock<Request & { user: IUser }>();
      reqMock.query = { pagePath: '/Sandbox' };

      const queryMock = mock<PageQuery>();

      // setup addNumCondition
      mocks.addNumConditionMock.mockImplementation(() => queryMock);
      // setup addSortCondition
      mocks.addSortConditionMock.mockImplementation(() => queryMock);

      // setup query.exec()
      const pageMock = mock<IPage>();
      queryMock.exec.mockImplementation(async() => [pageMock]);
      mocks.addSortConditionMock.mockImplementation(() => queryMock);

      // setup query.clone().count()
      const queryClonedMock = mock<PageQuery>();
      queryMock.clone.mockImplementationOnce(() => queryClonedMock);
      queryClonedMock.count.mockResolvedValue(9);

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
      const expectedResponseData: LsxApiResponseData = {
        pages: [pageMock],
        cursor: 1,
        total: 9,
        toppageViewersCount: 99,
      };
      expect(resStatusMock.send).toHaveBeenCalledWith(expectedResponseData);
    });

    it('returns 500 HTTP response when an unexpected error occured', async() => {
      // setup
      const reqMock = mock<Request & { user: IUser }>();
      reqMock.query = { pagePath: '/Sandbox' };

      // an Error instance will be thrown by addNumConditionMock
      const error = new Error('error for test');
      mocks.addNumConditionMock.mockImplementation(() => {
        throw error;
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
      expect(resStatusMock.send).toHaveBeenCalledWith(error.toString());
    });

    it('returns 400 HTTP response when the value is invalid', async() => {
      // setup
      const reqMock = mock<Request & { user: IUser }>();
      reqMock.query = { pagePath: '/Sandbox' };

      // an http-errors instance will be thrown by addNumConditionMock
      const error = createError(400, 'error for test');
      mocks.addNumConditionMock.mockImplementation(() => {
        throw error;
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
      expect(resStatusMock.send).toHaveBeenCalledWith(error.toString());
    });

  });
});
