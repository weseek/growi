import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:security:AdminLocalSecurityContainer');

/**
 * Service container for admin security page (LocalSecuritySetting.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminLocalSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      registrationMode: 'Open',
      registrationWhiteList: [],
    };

  }

  async retrieveSecurityData() {
    const response = await this.appContainer.apiv3.get('/security-setting/');
    const { localSetting } = response.data.securityParams;
    this.setState({
      registrationMode: localSetting.registrationMode,
      registrationWhiteList: localSetting.registrationWhiteList,
    });
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
    this.setState({ registrationWhiteList: value });
  }

  /**
   * update local security setting
   */
  async updateLocalSecuritySetting() {
    let { registrationWhiteList } = this.state;
    registrationWhiteList = Array.isArray(registrationWhiteList) ? registrationWhiteList : registrationWhiteList.split('\n');
    const response = await this.appContainer.apiv3.put('/security-setting/local-setting', {
      registrationMode: this.state.registrationMode,
      registrationWhiteList,
    });

    const { localSettingParams } = response.data;

    this.setState({
      registrationMode: localSettingParams.registrationMode || 'Open',
      registrationWhiteList: localSettingParams.registrationWhiteList || '',
    });

    return localSettingParams;
  }


}
