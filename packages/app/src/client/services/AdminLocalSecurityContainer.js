import { Container } from 'unstated';
import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminLocalSecurityContainer');
/**
 * Service container for admin security page (LocalSecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminLocalSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.dummyRegistrationMode = 0;
    this.dummyRegistrationModeForError = 1;

    this.state = {
      retrieveError: null,
      // set dummy value tile for using suspense
      registrationMode: this.dummyRegistrationMode,
      registrationWhiteList: [],
      useOnlyEnvVars: false,
    };

  }

  async retrieveSecurityData() {
    try {
      const response = await this.appContainer.apiv3.get('/security-setting/');
      const { localSetting } = response.data.securityParams;
      this.setState({
        useOnlyEnvVars: localSetting.useOnlyEnvVarsForSomeOptions,
        registrationMode: localSetting.registrationMode,
        registrationWhiteList: localSetting.registrationWhiteList,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch data');
    }

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminLocalSecurityContainer';
  }


  /**
   * Change registration mode
   */
  changeRegistrationMode(value) {
    this.setState({ registrationMode: value });
  }

  /**
   * Change registration white list
   */
  changeRegistrationWhiteList(value) {
    this.setState({ registrationWhiteList: value.split('\n') });
  }

  /**
   * update local security setting
   */
  async updateLocalSecuritySetting() {
    const { registrationWhiteList } = this.state;
    const response = await this.appContainer.apiv3.put('/security-setting/local-setting', {
      registrationMode: this.state.registrationMode,
      registrationWhiteList,
    });

    const { localSettingParams } = response.data;

    this.setState({
      registrationMode: localSettingParams.registrationMode,
      registrationWhiteList: localSettingParams.registrationWhiteList,
    });

    return localSettingParams;
  }


}
