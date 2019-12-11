const { getInstance } = require('../setup-crowi');

describe('Test for Crowi application context', () => {

  describe('construction', () => {
    test('initialize crowi context', async() => {
      const crowi = await getInstance();
      expect(crowi.version).toBe(require('@root/package.json').version);
      expect(typeof crowi.env).toBe('object');
    });

    test('config getter, setter', async() => {
      const crowi = await getInstance();
      expect(crowi.getConfig()).toEqual({});
      crowi.setConfig({ test: 1 });
      expect(crowi.getConfig()).toEqual({ test: 1 });
    });

    test('model getter, setter', async() => {
      const crowi = await getInstance();
      // set
      crowi.model('hoge', { fuga: 1 });
      expect(crowi.model('hoge')).toEqual({ fuga: 1 });
    });
  });

});
