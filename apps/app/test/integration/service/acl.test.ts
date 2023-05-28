import { aclService } from '../../../src/server/service/acl';
import { configManager } from '../../../src/server/service/config-manager';

describe('AclService test', () => {

  const initialEnv = process.env;

  beforeAll(async() => {
    await configManager.loadConfigs();
  });

  afterEach(() => {
    process.env = initialEnv;
  });


  describe('isAclEnabled()', () => {

    test('to be false when FORCE_WIKI_MODE is undefined', async() => {
      delete process.env.FORCE_WIKI_MODE;

      // reload
      await configManager.loadConfigs();

      const result = aclService.isAclEnabled();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe(undefined);
      expect(result).toBe(true);
    });

    test('to be false when FORCE_WIKI_MODE is dummy string', async() => {
      process.env.FORCE_WIKI_MODE = 'dummy string';

      // reload
      await configManager.loadConfigs();

      const result = aclService.isAclEnabled();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('dummy string');
      expect(result).toBe(true);
    });

    test('to be true when FORCE_WIKI_MODE=private', async() => {
      process.env.FORCE_WIKI_MODE = 'private';

      // reload
      await configManager.loadConfigs();

      const result = aclService.isAclEnabled();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('private');
      expect(result).toBe(true);
    });

    test('to be false when FORCE_WIKI_MODE=public', async() => {
      process.env.FORCE_WIKI_MODE = 'public';

      // reload
      await configManager.loadConfigs();

      const result = aclService.isAclEnabled();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('public');
      expect(result).toBe(false);
    });

  });


  describe('isWikiModeForced()', () => {

    test('to be false when FORCE_WIKI_MODE is undefined', async() => {
      delete process.env.FORCE_WIKI_MODE;

      // reload
      await configManager.loadConfigs();

      const result = aclService.isWikiModeForced();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe(undefined);
      expect(result).toBe(false);
    });

    test('to be false when FORCE_WIKI_MODE is dummy string', async() => {
      process.env.FORCE_WIKI_MODE = 'dummy string';

      // reload
      await configManager.loadConfigs();

      const result = aclService.isWikiModeForced();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('dummy string');
      expect(result).toBe(false);
    });

    test('to be true when FORCE_WIKI_MODE=private', async() => {
      process.env.FORCE_WIKI_MODE = 'private';

      // reload
      await configManager.loadConfigs();

      const result = aclService.isWikiModeForced();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('private');
      expect(result).toBe(true);
    });

    test('to be false when FORCE_WIKI_MODE=public', async() => {
      process.env.FORCE_WIKI_MODE = 'public';

      // reload
      await configManager.loadConfigs();

      const result = aclService.isWikiModeForced();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('public');
      expect(result).toBe(true);
    });

  });


  describe('isGuestAllowedToRead()', () => {
    let getConfigSpy;

    beforeEach(async() => {
      // prepare spy for ConfigManager.getConfig
      getConfigSpy = jest.spyOn(configManager, 'getConfig');
    });

    test('to be false when FORCE_WIKI_MODE=private', async() => {
      process.env.FORCE_WIKI_MODE = 'private';

      // reload
      await configManager.loadConfigs();

      const result = aclService.isGuestAllowedToRead();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('private');
      expect(getConfigSpy).not.toHaveBeenCalledWith('crowi', 'security:restrictGuestMode');
      expect(result).toBe(false);
    });

    test('to be true when FORCE_WIKI_MODE=public', async() => {
      process.env.FORCE_WIKI_MODE = 'public';

      // reload
      await configManager.loadConfigs();

      const result = aclService.isGuestAllowedToRead();

      const wikiMode = configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('public');
      expect(getConfigSpy).not.toHaveBeenCalledWith('crowi', 'security:restrictGuestMode');
      expect(result).toBe(true);
    });

    /* eslint-disable indent */
    describe.each`
      restrictGuestMode   | expected
      ${undefined}        | ${false}
      ${'Deny'}           | ${false}
      ${'Readonly'}       | ${true}
      ${'Open'}           | ${false}
      ${'Restricted'}     | ${false}
      ${'closed'}         | ${false}
    `('to be $expected', ({ restrictGuestMode, expected }) => {
      test(`when FORCE_WIKI_MODE is undefined and 'security:restrictGuestMode' is '${restrictGuestMode}`, async() => {

        // reload
        await configManager.loadConfigs();

        // setup mock implementation
        getConfigSpy.mockImplementation((ns, key) => {
          if (ns === 'crowi' && key === 'security:restrictGuestMode') {
            return restrictGuestMode;
          }
          if (ns === 'crowi' && key === 'security:wikiMode') {
            return undefined;
          }
          throw new Error('Unexpected behavior.');
        });

        const result = aclService.isGuestAllowedToRead();

        expect(getConfigSpy).toHaveBeenCalledTimes(2);
        expect(getConfigSpy).toHaveBeenCalledWith('crowi', 'security:wikiMode');
        expect(getConfigSpy).toHaveBeenCalledWith('crowi', 'security:restrictGuestMode');
        expect(result).toBe(expected);
      });
    });

  });


});
