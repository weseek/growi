import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import { toastError } from '../util/apiNotification';

const logger = loggerFactory('growi:loginForm');

/**
 * Service container for login form (LoginForm.jsx)
 * @extends {Container} unstated Container
 */
export default class LoginForm extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      isRegistrationEnabled: false,
      registrationMode: 'Closed',
      registrationWhiteList: [],
      isLocalStrategySetup: false,
      isLdapStrategySetup: false,
      objOfIsExternalAuthEnableds: {},
    };

    this.retrieveData = this.retrieveData.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'LoginContainer';
  }

  /**
   * retrieve app sttings data
   */
  async retrieveData() {
    try {
      const response = await this.appContainer.apiv3.get('/login/');
      const { data } = response.data;

      this.setState({
        isRegistrationEnabled: data.isRegistrationEnabled,
        registrationMode: data.registrationMode,
        registrationWhiteList: data.registrationWhiteList,
        isLocalStrategySetup: data.isLocalStrategySetup,
        isLdapStrategySetup: data.isLdapStrategySetup,
        objOfIsExternalAuthEnableds: data.objOfIsExternalAuthEnableds,
      });
    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to fetch data'));
    }
  }

  async loginWithExternalAuth(auth) {
    try {
      const axios = require('axios').create({
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        responseType: 'json',
      });
      await axios.get(`/passport/${auth}`, { params: { csrf: this.appContainer.csrfToken } });
    }
    catch (err) {
      logger.error(err);
      toastError(new Error(`Failed to access ${auth} login page`));
    }
  }

}
