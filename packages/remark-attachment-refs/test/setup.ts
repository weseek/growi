// Test setup file for vitest

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  // Uncomment to mock console methods
  // log: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};
