import each from 'jest-each';

const { getInstance } = require('../setup-crowi');

describe('AclService test', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;

  const initialEnv = process.env;

  beforeEach(async(done) => {
    crowi = await getInstance();
    process.env = initialEnv;
    done();
  });


  describe('isAclEnabled()', () => {

    test('to be false when FORCE_WIKI_MODE is undefined', async() => {
      delete process.env.FORCE_WIKI_MODE;

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isAclEnabled();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe(undefined);
      expect(result).toBe(true);
    });

    test('to be false when FORCE_WIKI_MODE is dummy string', async() => {
      process.env.FORCE_WIKI_MODE = 'dummy string';

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isAclEnabled();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('dummy string');
      expect(result).toBe(true);
    });

    test('to be true when FORCE_WIKI_MODE=private', async() => {
      process.env.FORCE_WIKI_MODE = 'private';

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isAclEnabled();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('private');
      expect(result).toBe(true);
    });

    test('to be false when FORCE_WIKI_MODE=public', async() => {
      process.env.FORCE_WIKI_MODE = 'public';

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isAclEnabled();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('public');
      expect(result).toBe(false);
    });

  });


  describe('isWikiModeForced()', () => {

    test('to be false when FORCE_WIKI_MODE is undefined', async() => {
      delete process.env.FORCE_WIKI_MODE;

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isWikiModeForced();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe(undefined);
      expect(result).toBe(false);
    });

    test('to be false when FORCE_WIKI_MODE is dummy string', async() => {
      process.env.FORCE_WIKI_MODE = 'dummy string';

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isWikiModeForced();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('dummy string');
      expect(result).toBe(false);
    });

    test('to be true when FORCE_WIKI_MODE=private', async() => {
      process.env.FORCE_WIKI_MODE = 'private';

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isWikiModeForced();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('private');
      expect(result).toBe(true);
    });

    test('to be false when FORCE_WIKI_MODE=public', async() => {
      process.env.FORCE_WIKI_MODE = 'public';

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isWikiModeForced();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('public');
      expect(result).toBe(true);
    });

  });


  describe('isGuestAllowedToRead()', () => {
    let getConfigSpy;

    beforeEach(async(done) => {
      // prepare spy for ConfigManager.getConfig
      getConfigSpy = jest.spyOn(crowi.configManager, 'getConfig');
      getConfigSpy.mockClear();
      done();
    });

    test('to be false when FORCE_WIKI_MODE=private', async() => {
      process.env.FORCE_WIKI_MODE = 'private';

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isGuestAllowedToRead();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('private');
      expect(getConfigSpy).not.toHaveBeenCalledWith('crowi', 'security:restrictGuestMode');
      expect(result).toBe(false);
    });

    test('to be true when FORCE_WIKI_MODE=public', async() => {
      process.env.FORCE_WIKI_MODE = 'public';

      // reload
      await crowi.configManager.loadConfigs();

      const result = crowi.aclService.isGuestAllowedToRead();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
      expect(wikiMode).toBe('public');
      expect(getConfigSpy).not.toHaveBeenCalledWith('crowi', 'security:restrictGuestMode');
      expect(result).toBe(true);
    });

    each`
    restrictGuestMode   | expected
      ${undefined}      | ${false}
      ${'Deny'}         | ${false}
      ${'Readonly'}     | ${true}
      ${'Open'}         | ${false}
      ${'Restricted'}   | ${false}
      ${'closed'}       | ${false}
    `
      .test('to be $expected when FORCE_WIKI_MODE is undefined'
          + ' and `security:restrictGuestMode` is \'$restrictGuestMode\'', async({ restrictGuestMode, expected }) => {

        // reload
        await crowi.configManager.loadConfigs();

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

        const result = crowi.aclService.isGuestAllowedToRead();

        expect(getConfigSpy).toHaveBeenCalledTimes(2);
        expect(getConfigSpy).toHaveBeenCalledWith('crowi', 'security:wikiMode');
        expect(getConfigSpy).toHaveBeenCalledWith('crowi', 'security:restrictGuestMode');
        expect(result).toBe(expected);
      });

  });


});
