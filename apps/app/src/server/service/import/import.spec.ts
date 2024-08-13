import { mock } from 'vitest-mock-extended';

import type Crowi from '~/server/crowi';

import { ImportService } from './import';

const mocks = vi.hoisted(() => {
  return {
    setupIndependentModelsMock: vi.fn(),
    testMock: vi.fn(),
  };
});

vi.mock('~/server/crowi/setup-models', () => ({
  setupIndependentModels: mocks.setupIndependentModelsMock,
}));

describe('ImportService', () => {

  let importService: ImportService;

  beforeAll(async() => {
    const crowiMock = mock<Crowi>({
      growiBridgeService: {
        getFile: vi.fn(),
      },
      tmpDir: '/tmp',
    });

    importService = new ImportService(crowiMock);
  });

  describe('preImport', () => {
    test('should call setupIndependentModels', async() => {
      // act
      await importService.preImport();

      // assert
      expect(mocks.setupIndependentModelsMock).toHaveBeenCalledOnce();
    });
  });
});
