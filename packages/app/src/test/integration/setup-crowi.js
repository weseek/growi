import Crowi from '~/server/crowi';

let _instance = null;

export async function getInstance(isNewInstance) {
  if (isNewInstance) {
    const crowi = new Crowi();
    await crowi.initForTest();
    return crowi;
  }

  // initialize singleton instance
  if (_instance == null) {
    _instance = new Crowi();
    await _instance.initForTest();
  }
  return _instance;
}
