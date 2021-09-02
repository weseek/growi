import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

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

    this.copyStateValues = {
      DEFAULT: 'default',
      DONE: 'done',
    };
    this.timer = null;

    this.state = {
      retrieveError: null,
      growiVersion: '',
      nodeVersion: '',
      npmVersion: '',
      yarnVersion: '',
      copyState: this.copyStateValues.DEFAULT,
      installedPlugins: [],
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminHomeContainer';
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  /**
   * retrieve admin home data
   */
  async retrieveAdminHomeData() {
    try {
      const response = await this.appContainer.apiv3.get('/admin-home/');
      const { adminHomeParams } = response.data;

      this.setState(prevState => ({
        ...prevState,
        growiVersion: adminHomeParams.growiVersion,
        nodeVersion: adminHomeParams.nodeVersion,
        npmVersion: adminHomeParams.npmVersion,
        yarnVersion: adminHomeParams.yarnVersion,
        installedPlugins: adminHomeParams.installedPlugins,
        envVars: adminHomeParams.envVars,
      }));
    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to fetch data'));
    }
  }

  /**
   * sets button text when copying system information
   */
  onCopyPrefilledHostInformation() {
    this.setState(prevState => ({
      ...prevState,
      copyState: this.copyStateValues.DONE,
    }));

    this.timer = setTimeout(() => {
      this.setState(prevState => ({
        ...prevState,
        copyState: this.copyStateValues.DEFAULT,
      }));
    }, 500);
  }

  /**
   * generates prefilled host information as markdown
   */
  generatePrefilledHostInformationMarkdown() {
    return `| item     | version |
| ---      | --- |
|OS        ||
|GROWI     |${this.state.growiVersion}|
|node.js   |${this.state.nodeVersion}|
|npm       |${this.state.npmVersion}|
|yarn      |${this.state.yarnVersion}|
|Using Docker|yes/no|
|Using [growi-docker-compose][growi-docker-compose]|yes/no|

[growi-docker-compose]: https://github.com/weseek/growi-docker-compose

*(Accessing https://{GROWI_HOST}/admin helps you to fill in above versions)*`;
  }

}
