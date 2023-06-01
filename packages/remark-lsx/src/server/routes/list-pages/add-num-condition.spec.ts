import type { IPage } from '@growi/core';
import { OptionParser } from '@growi/core/dist/plugin';
import createError from 'http-errors';
import type { Query, Document } from 'mongoose';
import { mock } from 'vitest-mock-extended';

import { addNumCondition } from './add-num-condition';

describe('addNumCondition()', () => {

  const queryMock = mock<Query<IPage[], Document>>();

  it('throws 400 http-errors instance when the option value is null', () => {
    // when
    const caller = () => addNumCondition(queryMock, null);

    // then
    expect(caller).toThrowError(createError(400, 'The value of num option is invalid.'));
  });

  it('throws 400 http-errors instance when the option value is true', () => {
    // when
    const caller = () => addNumCondition(queryMock, true);

    // then
    expect(caller).toThrowError(createError(400, 'The value of num option is invalid.'));
  });

  it('set limit with the specified number', () => {
    // setup
    const parseRangeSpy = vi.spyOn(OptionParser, 'parseRange');

    const queryLimitResultMock = mock<Query<IPage[], Document>>();
    queryMock.limit.calledWith(99).mockImplementation(() => queryLimitResultMock);

    // when
    const result = addNumCondition(queryMock, 99);

    // then
    expect(queryMock.limit).toHaveBeenCalledWith(99);
    expect(result).toEqual(queryLimitResultMock);
    expect(parseRangeSpy).not.toHaveBeenCalled();
  });

  it('returns the specified qeury as-is when the option value is invalid', () => {
    // setup
    const parseRangeSpy = vi.spyOn(OptionParser, 'parseRange');

    // when
    const result = addNumCondition(queryMock, 'invalid string');

    // then
    expect(queryMock.limit).not.toHaveBeenCalledWith(99);
    expect(parseRangeSpy).toHaveBeenCalledWith('invalid string');
    expect(result).toEqual(queryMock);
  });

});


describe('addNumCondition() set skip and limit with the range string', () => {

  it.concurrent.each`
    optionsNum    | expectedSkip    | expectedLimit
    ${'1:10'}     | ${0}            | ${10}
  `("'$optionsNum", ({ optionsNum, expectedSkip, expectedLimit }) => {
    // setup
    const queryMock = mock<Query<IPage[], Document>>();

    const querySkipResultMock = mock<Query<IPage[], Document>>();
    queryMock.skip.calledWith(expectedSkip).mockImplementation(() => querySkipResultMock);

    const queryLimitResultMock = mock<Query<IPage[], Document>>();
    querySkipResultMock.limit.calledWith(expectedLimit).mockImplementation(() => queryLimitResultMock);

    const parseRangeSpy = vi.spyOn(OptionParser, 'parseRange');

    // when
    const result = addNumCondition(queryMock, optionsNum);

    // then
    expect(parseRangeSpy).toHaveBeenCalledWith(optionsNum);
    expect(queryMock.skip).toHaveBeenCalledWith(expectedSkip);
    expect(querySkipResultMock.limit).toHaveBeenCalledWith(expectedLimit);
    expect(result).toEqual(queryLimitResultMock);
  });

});
