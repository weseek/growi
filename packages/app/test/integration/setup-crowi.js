import Crowi from '~/server/crowi';

let _instance = null;

const initCrowi = async(crowi) => {
  await crowi.setupModels();
  await crowi.setupConfigManager();

  await crowi.setupSocketIoService();

  await Promise.all([
    crowi.setUpApp(),
    crowi.setUpXss(),
  ]);

  await Promise.all([
    crowi.setupPassport(),
    crowi.setupAttachmentService(),
    crowi.setUpAcl(),
    crowi.setupPageService(),
    crowi.setupInAppNotificationService(),
    crowi.setupActivityService(),
  ]);
};

export async function getInstance(isNewInstance) {
  if (isNewInstance) {
    const crowi = new Crowi();
    await initCrowi(crowi);
    return crowi;
  }

  // initialize singleton instance
  if (_instance == null) {
    _instance = new Crowi();
    await initCrowi(_instance);
  }
  return _instance;
}
