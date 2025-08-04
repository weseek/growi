import { createServer, type Server } from 'node:http';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import express from 'express';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { useSWRxRef, useSWRxRefs } from '../src/client/stores/refs';
import { routesFactory } from '../src/server/routes/refs';

// Test server setup
let testServer: Server;
let baseURL: string;

// Mock data for testing
const mockUser = {
  _id: 'user123',
  username: 'testuser',
  email: 'test@example.com',
};

const mockPage = {
  _id: 'page123',
  path: '/test/page',
};

const mockAttachment = {
  _id: 'attachment123',
  originalName: 'test-file.pdf',
  fileName: 'test-file.pdf',
  fileFormat: 'pdf',
  filePath: '/uploads/test-file.pdf',
  filePathProxied: '/api/attachments/attachment123',
  downloadPathProxied: '/api/attachments/attachment123/download',
  fileSize: 1024,
  attachmentType: 'file',
  page: 'page123',
  creator: 'user123',
  createdAt: '2023-01-01T00:00:00.000Z', // Use string format to match JSON serialization
};

const mockAttachments = [
  {
    _id: 'attachment1',
    originalName: 'file1.pdf',
    fileName: 'file1.pdf',
    filePath: '/uploads/file1.pdf',
    creator: mockUser._id,
    page: mockPage._id, // This should match the page ID returned by the page query
    createdAt: '2023-01-01T00:00:00.000Z', // JSON serialized format
    fileFormat: 'pdf',
    fileSize: 1024,
    attachmentType: 'file',
    filePathProxied: '/api/attachments/attachment1',
    downloadPathProxied: '/api/attachments/attachment1/download',
  },
  {
    _id: 'attachment2',
    originalName: 'file2.jpg',
    fileName: 'file2.jpg',
    filePath: '/uploads/file2.jpg',
    creator: mockUser._id,
    page: mockPage._id, // This should match the page ID returned by the page query
    createdAt: '2023-01-01T00:00:00.000Z', // JSON serialized format
    fileFormat: 'image',
    fileSize: 2048,
    attachmentType: 'image',
    filePathProxied: '/api/attachments/attachment2',
    downloadPathProxied: '/api/attachments/attachment2/download',
  },
];

// Mock the Growi dependencies that the routes need
const mockCrowi = {
  require: vi.fn((path) => {
    if (path === '../middlewares/login-required') {
      return () => (_req, _res, next) => {
        // Mock authentication - add user to request
        _req.user = mockUser;
        next();
      };
    }
    return vi.fn();
  }),
  accessTokenParser: (_req, _res, next) => next(),
};

// Mock mongoose models
const mockPageModel = {
  findByPathAndViewer: vi.fn(),
  isAccessiblePageByViewer: vi.fn().mockResolvedValue(true),
  find: vi.fn().mockImplementation(() => {
    // Return a mock query that has chaining methods
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        { id: mockPage._id }, // Return our mock page ID
      ]),
    };
    return mockQuery;
  }),
  addConditionToFilteringByViewerForList: vi.fn(),
  PageQueryBuilder: vi.fn().mockImplementation((query) => ({
    query: query || mockPageModel.find(), // Use the actual query or fall back to find()
    addConditionToListWithDescendants: vi.fn().mockReturnThis(),
    addConditionToExcludeTrashed: vi.fn().mockReturnThis(),
  })),
};

const mockAttachmentModel = {
  findOne: vi.fn(),
  find: vi.fn().mockImplementation(() => {
    // Return a mock query that supports chaining
    const mockQuery = {
      and: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(mockAttachments), // Return our mock attachments
    };
    return mockQuery;
  }),
  and: vi.fn().mockReturnThis(),
  populate: vi.fn().mockReturnThis(),
  exec: vi.fn().mockResolvedValue(mockAttachments),
};

// Mock mongoose
vi.mock('mongoose', () => ({
  default: {
    model: vi.fn((modelName) => {
      if (modelName === 'Page') return mockPageModel;
      if (modelName === 'Attachment') return mockAttachmentModel;
      return {};
    }),
  },
  model: vi.fn((modelName) => {
    if (modelName === 'Attachment') return mockAttachmentModel;
    return {};
  }),
  Types: {
    ObjectId: class MockObjectId {
      private id: string;

      constructor(id: string) {
        this.id = id;
      }

      static isValid(_id: unknown): boolean {
        return true; // Accept any ID as valid for testing
      }

      toString(): string {
        return this.id;
      }
    },
  },
}));

// Mock the serializer
vi.mock('@growi/core/dist/models/serializers', () => ({
  serializeAttachmentSecurely: vi.fn((attachment) => attachment),
}));

describe('refs hooks - Integration Tests with Actual Routes', () => {
  beforeAll(async () => {
    // Create a real Express app with the actual routes
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Create the routes using the real routesFactory with our mocks
    const router = routesFactory(mockCrowi);
    app.use('/_api/attachment-refs', router);

    // Start the test server on a dynamic port
    testServer = createServer(app);

    await new Promise<void>((resolve) => {
      testServer.listen(0, () => {
        const address = testServer.address();
        if (address && typeof address === 'object') {
          const port = address.port;
          baseURL = `http://localhost:${port}`;
          console.log(`Test server started on ${baseURL}`);
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Clean up the test server
    if (testServer) {
      await new Promise<void>((resolve) => {
        testServer.close(() => resolve());
      });
    }
  });

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock behaviors
    mockPageModel.findByPathAndViewer.mockResolvedValue(mockPage);
    mockPageModel.isAccessiblePageByViewer.mockResolvedValue(true);

    mockAttachmentModel.findOne.mockImplementation(() => ({
      populate: vi.fn().mockResolvedValue(mockAttachment),
    }));

    mockAttachmentModel.find.mockReturnValue({
      and: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(mockAttachments),
    });
  });

  describe('SWR Hook Integration Tests', () => {
    it('should test useSWRxRef hook with real server requests', async () => {
      // Arrange
      const pagePath = '/test/page';
      const fileNameOrId = 'test-file.pdf';

      // Configure axios to use our test server
      const originalDefaults = axios.defaults.baseURL;
      axios.defaults.baseURL = baseURL;

      try {
        console.log(`Testing with baseURL: ${baseURL}`);

        // Act - Test the hook with real server
        const { result } = renderHook(() =>
          useSWRxRef(pagePath, fileNameOrId, false),
        );

        // Wait for the hook to complete the request
        await waitFor(
          () => {
            console.log('Hook result:', result.current);
            expect(result.current.data).toBeDefined();
          },
          { timeout: 5000 },
        );

        // Assert - Hook should return attachment data from real server
        expect(result.current.data).toEqual(mockAttachment);
        expect(result.current.error).toBeUndefined();
      } finally {
        // Restore original axios defaults
        axios.defaults.baseURL = originalDefaults;
      }
    });

    it('should test useSWRxRefs hook with real server requests', async () => {
      // Arrange
      const pagePath = '/test/page';
      const prefix = '/test';
      const options = { depth: '1', regexp: '.*\\.pdf$' };

      // Configure axios to use our test server
      const originalDefaults = axios.defaults.baseURL;
      axios.defaults.baseURL = baseURL;

      try {
        console.log(`Testing with baseURL: ${baseURL}`);

        // Act - Test the hook with real server
        const { result } = renderHook(() =>
          useSWRxRefs(pagePath, prefix, options, false),
        );

        // Wait for the hook to complete the request
        await waitFor(
          () => {
            console.log('Hook result:', result.current);
            expect(result.current.data).toBeDefined();
          },
          { timeout: 5000 },
        );

        // Assert - Hook should return attachments data from real server
        expect(result.current.data).toEqual(mockAttachments);
        expect(result.current.error).toBeUndefined();
      } finally {
        // Restore original axios defaults
        axios.defaults.baseURL = originalDefaults;
      }
    });
  });
});
