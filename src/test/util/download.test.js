import path from 'path';
import fs from 'graceful-fs';
import streamToPromise from 'stream-to-promise';
import { Transform } from 'stream';

import axios from '~/utils/axios';
import { downloadTo } from '~/utils/download';

jest.mock('~/utils/axios');
// jest.mock('mkdirp');
// jest.mock('graceful-fs');
// jest.mock('path');
// jest.mock('stream-to-promise');

describe('.downloadTo', () => {
  describe('test download', () => {
    const outDirName = 'outDir';
    const outFileName = 'fileName';
    beforeEach(() => {
      const testFileName = 'testfile';
      fs.writeFileSync(testFileName, 'test text');
      axios.get.mockResolvedValue({ data: fs.createReadStream(testFileName) });
    });
    afterEach(() => {
      fs.rmdirSync(outDirName, { recursive: true });
      fs.unlinkSync('testfile');
    });
    test('should be download testfile when no exists transform in args', async() => {
      await downloadTo('url', outDirName, outFileName);
      expect(fs.readFileSync('outDir/fileName', 'utf-8')).toBe('test text');
    });
    test('should be download testfile when exists transform in args', async() => {
      const noop = new Transform({
        transform(chunk, _encoding, done) {
          this.push(chunk);
          done();
        },
      });
      await downloadTo('url', outDirName, outFileName, noop);
      expect(fs.readFileSync('outDir/fileName', 'utf-8')).toBe('test text');
    });
  });
  // Skip because the cannot be reset mock
  describe.skip('test functions coll', () => {
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
});
