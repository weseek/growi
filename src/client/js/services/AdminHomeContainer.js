import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import { toastError } from '../util/apiNotification';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminHomeContainer');

/**
 * Service container for admin home page (AdminHome.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminHomeContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      growiVersion: '',
      nodeVersion: '',
      npmVersion: '',
      yarnVersion: '',
      installedPlugins: [],
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminHomeContainer';
  }

  /**
   * retrieve admin home data
   */
  async retrieveAdminHomeData() {
    try {
      const response = await this.appContainer.apiv3.get('/admin-home/');
      const { adminHomeParams } = response.data;

      this.setState({
        growiVersion: adminHomeParams.growiVersion,
        nodeVersion: adminHomeParams.nodeVersion,
        npmVersion: adminHomeParams.npmVersion,
        yarnVersion: adminHomeParams.yarnVersion,
        installedPlugins: adminHomeParams.installedPlugins,
      });
    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to fetch data'));
    }
  }

}
