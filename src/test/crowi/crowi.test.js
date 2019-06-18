const helpers = require('@commons/util/helpers');

describe('Test for Crowi application context', () => {

  const Crowi = require('@server/crowi');

  describe('construction', () => {
    test('initialize crowi context', () => {
      const crowi = new Crowi(helpers.root());
      expect(crowi).toBeInstanceOf(Crowi);
      expect(crowi.version).toBe(require('@root/package.json').version);
      expect(typeof crowi.env).toBe('object');
    });

    test('config getter, setter', () => {
      const crowi = new Crowi(helpers.root());
      expect(crowi.getConfig()).toEqual({});
      crowi.setConfig({ test: 1 });
      expect(crowi.getConfig()).toEqual({ test: 1 });
    });

    test('model getter, setter', () => {
      const crowi = new Crowi(helpers.root());
      // set
      crowi.model('hoge', { fuga: 1 });
      expect(crowi.model('hoge')).toEqual({ fuga: 1 });
    });
  });

});
