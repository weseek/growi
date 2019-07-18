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

      expect(process.env.FORCE_WIKI_MODE).not.toBeDefined();
      expect(crowi.aclService.isAclEnabled()).toBe(true);
    });

    test('to be true when FORCE_WIKI_MODE=private', async() => {
      process.env.FORCE_WIKI_MODE = 'private';

      // reload
      await crowi.configManager.loadConfigs();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');

      expect(wikiMode).toBe('private');
      expect(crowi.aclService.isAclEnabled()).toBe(true);
    });

    test('to be false when FORCE_WIKI_MODE=public', async() => {
      process.env.FORCE_WIKI_MODE = 'public';

      // reload
      await crowi.configManager.loadConfigs();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');

      expect(wikiMode).toBe('public');
      expect(crowi.aclService.isAclEnabled()).toBe(false);
    });

  });

  describe('isGuestAllowedToRead()', () => {
    let getConfigSpy;

    beforeEach(async(done) => {
      // prepare spy for ConfigManager.getConfig
      getConfigSpy = jest.spyOn(crowi.configManager, 'getConfig');
      done();
    });

    test('to be false when FORCE_WIKI_MODE=private', async() => {
      process.env.FORCE_WIKI_MODE = 'private';

      // reload
      await crowi.configManager.loadConfigs();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');

      expect(wikiMode).toBe('private');
      expect(getConfigSpy).not.toHaveBeenCalledWith('crowi', 'security:restrictGuestMode');
      expect(crowi.aclService.isGuestAllowedToRead()).toBe(false);
    });

    test('to be true when FORCE_WIKI_MODE=public', async() => {
      process.env.FORCE_WIKI_MODE = 'public';

      // reload
      await crowi.configManager.loadConfigs();

      const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');

      expect(wikiMode).toBe('public');
      expect(getConfigSpy).not.toHaveBeenCalledWith('crowi', 'security:restrictGuestMode');
      expect(crowi.aclService.isGuestAllowedToRead()).toBe(true);
    });

  });

});
