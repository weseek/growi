import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:PersonalContainer');

/**
 * Service container for personal settings page (PersonalSettings.jsx)
 * @extends {Container} unstated Container
 */
export default class PersonalContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      name: '',
      email: '',
      registrationWhiteList: this.appContainer.getConfig().registrationWhiteList,
      isEmailPublished: false,
      lang: 'en-US',
      externalAccounts: [],
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PersonalContainer';
  }

  /**
   * retrieve personal data
   */
  async retrievePersonalData() {
    try {
      const response = await this.appContainer.apiv3.get('/personal-setting/');
      const { currentUser } = response.data;

      this.setState({
        name: currentUser.name,
        email: currentUser.email,
        isEmailPublished: currentUser.isEmailPublished,
        lang: currentUser.lang,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch personal data');
    }
  }

  /**
   * retrieve external accounts that linked me
   */
  async retrieveExternalAccounts() {
    try {
      const response = await this.appContainer.apiv3.get('/personal-setting/external-accounts');
      const { externalAccounts } = response.data;

      this.setState({ externalAccounts });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch external accounts');
    }
  }

  /**
   * Change name
   */
  changeName(inputValue) {
    this.setState({ name: inputValue });
  }

  /**
   * Change email
   */
  changeEmail(inputValue) {
    this.setState({ email: inputValue });
  }

  /**
   * Change isEmailPublished
   */
  changeIsEmailPublished(boolean) {
    this.setState({ isEmailPublished: boolean });
  }

  /**
   * Change lang
   */
  changeLang(lang) {
    this.setState({ lang });
  }

  /**
   * Update basic info
   * @memberOf PersonalContainer
   * @return {Array} basic info
   */
  async updateBasicInfo() {
    // TODO GW-1036 create apiV3
  }

}
