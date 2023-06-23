import examplePkg from '^/test/fixtures/example-package/template1/package.json';

import { GrowiPluginType } from '~/consts';

import { validatePackageJson } from './validate';

const mocks = vi.hoisted(() => {
  return {
    importPackageJsonMock: vi.fn(),
  };
});

vi.mock('./import', () => {
  return { importPackageJson: mocks.importPackageJsonMock };
});

describe('validatePackageJson()', () => {

  it('returns a data object', async() => {
    // setup
    mocks.importPackageJsonMock.mockResolvedValue(examplePkg);

    // when
    const data = await validatePackageJson('package.json');

    // then
    expect(data).not.toBeNull();
  });

  it("with the 'expectedPluginType' argument returns a data object", async() => {
    // setup
    mocks.importPackageJsonMock.mockResolvedValue(examplePkg);

    // when
    const data = await validatePackageJson('package.json', GrowiPluginType.TEMPLATE);

    // then
    expect(data).not.toBeNull();
  });

  describe('should throw an GrowiPluginValidationError', () => {

    it("when the pkg does not have 'growiPlugin' directive", async() => {
      // setup
      mocks.importPackageJsonMock.mockResolvedValue({});

      // when
      const caller = async() => { await validatePackageJson('package.json') };

      // then
      await expect(caller).rejects.toThrow("The package.json does not have 'growiPlugin' directive.");
    });

    it("when the 'schemaVersion' is NaN", async() => {
      // setup
      mocks.importPackageJsonMock.mockResolvedValue({
        growiPlugin: {
          schemaVersion: 'foo',
        },
      });

      // when
      const caller = async() => { await validatePackageJson('package.json') };

      // then
      await expect(caller).rejects.toThrow("The growiPlugin directive must have a valid 'schemaVersion' directive.");
    });

    it("when the 'schemaVersion' is less than 4", async() => {
      // setup
      mocks.importPackageJsonMock.mockResolvedValue({
        growiPlugin: {
          schemaVersion: 3,
        },
      });

      // when
      const caller = async() => { await validatePackageJson('package.json') };

      // then
      await expect(caller).rejects.toThrow("The growiPlugin directive must have a valid 'schemaVersion' directive.");
    });

    it("when the 'types' directive does not exist", async() => {
      // setup
      mocks.importPackageJsonMock.mockResolvedValue({
        growiPlugin: {
          schemaVersion: 4,
        },
      });

      // when
      const caller = async() => { await validatePackageJson('package.json') };

      // then
      await expect(caller).rejects.toThrow("The growiPlugin directive does not have 'types' directive.");
    });

    it("when the 'types' directive does not have expected plugin type", async() => {
      // setup
      mocks.importPackageJsonMock.mockResolvedValue({
        growiPlugin: {
          schemaVersion: 4,
          types: [GrowiPluginType.TEMPLATE],
        },
      });

      // when
      const caller = async() => { await validatePackageJson('package.json', GrowiPluginType.SCRIPT) };

      // then
      await expect(caller).rejects.toThrow("The growiPlugin directive does not have expected plugin type in 'types' directive.");
    });
  });

});
