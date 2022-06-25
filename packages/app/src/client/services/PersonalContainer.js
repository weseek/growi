import { Container } from 'unstated';

import { AttachmentType } from '~/server/interfaces/attachment';
import loggerFactory from '~/utils/logger';

import { apiPost } from '../util/apiv1-client';
import { apiv3Get, apiv3Put } from '../util/apiv3-client';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:PersonalContainer');

const DEFAULT_IMAGE = '/images/icons/user.svg';

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
      lang: 'en_US',
      isGravatarEnabled: false,
      isUploadedPicture: false,
      uploadedPictureSrc: this.getUploadedPictureSrc(this.appContainer.currentUser),
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

  /**
   * retrieve personal data
   */
  async retrievePersonalData() {
    try {
      const response = await apiv3Get('/personal-setting/');
      const { currentUser } = response.data;
      this.setState({
        name: currentUser.name,
        email: currentUser.email,
        isEmailPublished: currentUser.isEmailPublished,
        lang: currentUser.lang,
        isGravatarEnabled: currentUser.isGravatarEnabled,
        apiToken: currentUser.apiToken,
        slackMemberId: currentUser.slackMemberId,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch personal data');
    }
  }

  /**
   * define a function for uploaded picture
   */
  getUploadedPictureSrc(user) {
    if (user == null) {
      return DEFAULT_IMAGE;
    }
    if (user.image) {
      this.setState({ isUploadedPicture: true });
      return user.image;
    }
    if (user.imageAttachment != null) {
      this.setState({ isUploadedPicture: true });
      return user.imageAttachment.filePathProxied;
    }

    return DEFAULT_IMAGE;
  }

  /**
   * retrieve external accounts that linked me
   */
  async retrieveExternalAccounts() {
    try {
      const response = await apiv3Get('/personal-setting/external-accounts');
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
   * Change Slack Member ID
   */
  changeSlackMemberId(inputValue) {
    this.setState({ slackMemberId: inputValue });
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
   * Change isGravatarEnabled
   */
  changeIsGravatarEnabled(boolean) {
    this.setState({ isGravatarEnabled: boolean });
  }

  /**
   * Update basic info
   * @memberOf PersonalContainer
   * @return {Array} basic info
   */
  async updateBasicInfo() {
    try {
      const response = await apiv3Put('/personal-setting/', {
        name: this.state.name,
        email: this.state.email,
        isEmailPublished: this.state.isEmailPublished,
        lang: this.state.lang,
        slackMemberId: this.state.slackMemberId,
      });
      const { updatedUser } = response.data;

      this.setState({
        name: updatedUser.name,
        email: updatedUser.email,
        isEmailPublished: updatedUser.isEmailPublished,
        lang: updatedUser.lang,
        slackMemberId: updatedUser.slackMemberId,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to update personal data');
    }
  }


  /**
   * Associate LDAP account
   */
  async associateLdapAccount(account) {
    try {
      await apiv3Put('/personal-setting/associate-ldap', account);
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to associate ldap account');
    }
  }

  /**
   * Disassociate LDAP account
   */
  async disassociateLdapAccount(account) {
    try {
      await apiv3Put('/personal-setting/disassociate-ldap', account);
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to disassociate ldap account');
    }
  }

}
