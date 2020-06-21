import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

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
      isPasswordSet: false,
      apiToken: '',
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
        isGravatarEnabled: currentUser.isGravatarEnabled,
        isPasswordSet: (currentUser.password != null),
        apiToken: currentUser.apiToken,
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
      const response = await this.appContainer.apiv3.put('/personal-setting/', {
        name: this.state.name,
        email: this.state.email,
        isEmailPublished: this.state.isEmailPublished,
        lang: this.state.lang,
      });
      const { updatedUser } = response.data;

      this.setState({
        name: updatedUser.name,
        email: updatedUser.email,
        isEmailPublished: updatedUser.isEmailPublished,
        lang: updatedUser.lang,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to update personal data');
    }
  }

  /**
   * Update profile image
   * @memberOf PersonalContainer
   */
  async updateProfileImage() {
    try {
      const response = await this.appContainer.apiv3.put('/personal-setting/image-type', {
        isGravatarEnabled: this.state.isGravatarEnabled,
      });
      const { userData } = response.data;
      this.setState({
        isGravatarEnabled: userData.isGravatarEnabled,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to update profile image');
    }
  }

  /**
   * Upload image
   */
  async uploadAttachment(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('_csrf', this.appContainer.csrfToken);
      const response = await this.appContainer.apiPost('/attachments.uploadProfileImage', formData);
      this.setState({ isUploadedPicture: true, uploadedPictureSrc: response.attachment.filePathProxied });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to upload profile image');
    }
  }

  /**
   * Delete image
   */
  async deleteProfileImage() {
    try {
      await this.appContainer.apiPost('/attachments.removeProfileImage', { _csrf: this.appContainer.csrfToken });
      this.setState({ isUploadedPicture: false, uploadedPictureSrc: DEFAULT_IMAGE });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to delete profile image');
    }
  }

  /**
   * Associate LDAP account
   */
  async associateLdapAccount(account) {
    try {
      await this.appContainer.apiv3.put('/personal-setting/associate-ldap', account);
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
      await this.appContainer.apiv3.put('/personal-setting/disassociate-ldap', account);
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to disassociate ldap account');
    }
  }

}
