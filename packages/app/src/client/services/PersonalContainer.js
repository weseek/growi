import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

import { apiv3Put } from '../util/apiv3-client';

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
      isEmailPublished: false,
      lang: 'en_US',
      isGravatarEnabled: false,
      externalAccounts: [],
      apiToken: '',
      slackMemberId: '',
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PersonalContainer';
  }


}
