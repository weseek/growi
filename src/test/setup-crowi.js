const helpers = require('@commons/util/helpers');

const Crowi = require('@server/crowi');

let _instance = null;

async function createInstance() {
  const crowi = new Crowi(helpers.root());
  await crowi.initForTest();

  return crowi;
}

async function getInstance(isNewInstance) {
  if (isNewInstance) {
    return createInstance();
  }

  // initialize singleton instance
  if (_instance == null) {
    _instance = await createInstance();
  }
  return _instance;
}

module.exports = {
  getInstance,
};
