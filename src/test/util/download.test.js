import axios from 'axios';
import path from 'path';
import fs from 'graceful-fs';
import streamToPromise from 'stream-to-promise';
import { downloadTo } from '~/utils/download';

jest.mock('axios');
jest.mock('mkdirp');
jest.mock('graceful-fs');
jest.mock('path');
jest.mock('stream-to-promise');

describe('.downloadTo', () => {
  beforeAll(() => {
    streamToPromise.mockImplementation(jest.fn().mockImplementation(() => { return 'streamToPromise' }));
    path.join.mockImplementation(jest.fn().mockImplementation(() => { return 'filePath' }));
    fs.createWriteStream.mockImplementation(jest.fn().mockImplementation(() => { return 'createWriteStream' }));

  });
  describe('when no exists transform in args', () => {
    const pipeMock = jest.fn().mockImplementation(() => { return 'writeStream' });
    const returnStreamPipeMock = jest.fn().mockImplementation(() => { return { pipe: pipeMock } });
    beforeAll(() => {
      axios.get.mockResolvedValue({ data: { pipe: returnStreamPipeMock } });
    });
    test('should intended functions coll', async() => {
      const result = await downloadTo('url', 'outDir', 'fileName', 'transform');
      expect(returnStreamPipeMock.mock.calls[0][0]).toBe('transform');
      expect(path.join.mock.calls[0]).toMatchObject(['outDir', 'fileName']);
      expect(fs.createWriteStream.mock.calls[0][0]).toBe('filePath');
      expect(pipeMock.mock.calls[0][0]).toBe('createWriteStream');
      expect(streamToPromise.mock.calls[0][0]).toBe('writeStream');
      expect(result).toBe('streamToPromise');
    });
  });
  describe('when exists transform in args', () => {
    const pipeMock = jest.fn().mockImplementation(() => { return 'writeStream' });
    beforeAll(() => {
      axios.get.mockResolvedValue({ data: { pipe: pipeMock } });
    });
    test('should intended functions coll', async() => {
      const result = await downloadTo('url', 'outDir', 'fileName');
      expect(path.join.mock.calls[0]).toMatchObject(['outDir', 'fileName']);
      expect(fs.createWriteStream.mock.calls[0][0]).toBe('filePath');
      expect(pipeMock.mock.calls[0][0]).toBe('createWriteStream');
      expect(streamToPromise.mock.calls[0][0]).toBe('writeStream');
      expect(result).toBe('streamToPromise');
    });
  });
});
