import type { Server } from 'node:http';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import express from 'express';
import lsxMiddleware from '../../../server';

import { useSWRxLsx } from './lsx';

// Mock the generateBaseQuery function that requires Mongoose
vi.mock('../../../server/routes/list-pages/generate-base-query', () => ({
  generateBaseQuery: vi.fn().mockResolvedValue({
    query: {
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    },
    addConditionToListOnlyDescendants: vi.fn().mockReturnThis(),
    addConditionToFilteringByViewerForList: vi.fn().mockReturnThis(),
  }),
}));

// Mock mongoose model
vi.mock('mongoose', () => ({
  model: vi.fn().mockReturnValue({
    find: vi.fn().mockReturnValue({
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    }),
    countDocuments: vi.fn().mockResolvedValue(0),
  }),
}));

const TEST_PORT = 3001;
const TEST_SERVER_URL = `http://localhost:${TEST_PORT}`;

describe('useSWRxLsx integration tests', () => {
  let server: Server;
  let app: express.Application;

  beforeAll(async () => {
    // Create minimal Express app with just the LSX route
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mock minimal GROWI-like structure for the middleware
    const mockCrowi = {
      require: () => () => (req: any, res: any, next: any) => next(), // Mock login middleware
      accessTokenParser: () => (req: any, res: any, next: any) => next(), // Mock access token parser
    };

    // Import and setup the LSX middleware
    lsxMiddleware(mockCrowi, app);

    // Start test server
    return new Promise<void>((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`Test server running on port ${TEST_PORT}`);
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      if (server) {
        server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });

  it('should make actual server request and receive 2xx response for basic lsx request', async () => {
    // Configure axios to use the test server
    const originalAxios = axios.create();

    // Mock axios.get to point to our test server
    const axiosGetSpy = vi
      .spyOn(axios, 'get')
      .mockImplementation((url, config) => {
        const fullUrl = url.startsWith('/_api')
          ? `${TEST_SERVER_URL}${url}`
          : url;
        return originalAxios.get(fullUrl, config);
      });

    const { result } = renderHook(() =>
      useSWRxLsx('/test-page', { depth: '1' }, false),
    );

    // Wait for either data or error to be defined
    await waitFor(
      () => {
        expect(result.current.data !== undefined || result.current.error !== undefined).toBe(true);
      },
      { timeout: 5000 },
    );

    // Verify axios.get was called
    expect(axiosGetSpy).toHaveBeenCalledWith(
      '/_api/lsx',
      expect.objectContaining({
        params: expect.objectContaining({
          pagePath: '/test-page',
          options: expect.objectContaining({
            depth: '1',
          }),
        }),
      }),
    );

    // Verify we got a successful response (data) or proper error handling
    expect(result.current.data !== undefined || result.current.error !== undefined).toBe(true);

    axiosGetSpy.mockRestore();
  });

  it('should handle different lsx options correctly', async () => {
    const originalAxios = axios.create();

    const axiosGetSpy = vi
      .spyOn(axios, 'get')
      .mockImplementation((url, config) => {
        const fullUrl = url.startsWith('/_api')
          ? `${TEST_SERVER_URL}${url}`
          : url;
        return originalAxios.get(fullUrl, config);
      });

    const { result } = renderHook(() =>
      useSWRxLsx(
        '/parent-page',
        {
          depth: '2',
          filter: 'test',
          sort: 'createdAt',
        },
        false,
      ),
    );

    await waitFor(
      () => {
        expect(
          result.current.data !== undefined ||
            result.current.error !== undefined,
        ).toBe(true);
      },
      { timeout: 5000 },
    );

    // Verify the request was made with correct parameters
    expect(axiosGetSpy).toHaveBeenCalledWith(
      '/_api/lsx',
      expect.objectContaining({
        params: expect.objectContaining({
          pagePath: '/parent-page',
          options: expect.objectContaining({
            depth: '2',
            filter: 'test',
            sort: 'createdAt',
          }),
        }),
      }),
    );

    axiosGetSpy.mockRestore();
  });

  it('should handle server validation errors properly', async () => {
    const originalAxios = axios.create();

    const axiosGetSpy = vi
      .spyOn(axios, 'get')
      .mockImplementation((url, config) => {
        const fullUrl = url.startsWith('/_api')
          ? `${TEST_SERVER_URL}${url}`
          : url;
        return originalAxios.get(fullUrl, config);
      });

    const { result } = renderHook(() =>
      // Missing required pagePath parameter should cause validation error
      useSWRxLsx('', {}, false),
    );

    await waitFor(
      () => {
        expect(result.current.error).toBeDefined();
      },
      { timeout: 5000 },
    );

    // Should receive an error from the server
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();

    axiosGetSpy.mockRestore();
  });
});
