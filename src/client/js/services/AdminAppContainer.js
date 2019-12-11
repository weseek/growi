import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import { toastError } from '../util/apiNotification';

const logger = loggerFactory('growi:appSettings');

/**
 * Service container for admin app setting page (AppSettings.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminAppContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      title: '',
      confidential: '',
      globalLang: '',
      fileUpload: '',
      siteUrl: '',
      envSiteUrl: '',
      isSetSiteUrl: true,
    };

    this.changeTitle = this.changeTitle.bind(this);
    this.changeConfidential = this.changeConfidential.bind(this);
    this.changeGlobalLang = this.changeGlobalLang.bind(this);
    this.changeFileUpload = this.changeFileUpload.bind(this);
    this.changeSiteUrl = this.changeSiteUrl.bind(this);
    this.updateAppSettingHandler = this.updateAppSettingHandler.bind(this);
    this.updateSiteUrlSettingHandler = this.updateSiteUrlSettingHandler.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminAppContainer';
  }

  /**
   * retrieve app sttings data
   */
  async retrieveAppSettingsData() {
    try {
      const response = await this.appContainer.apiv3.get('/app-settings/');
      const { appSettingParams } = response.data;

      this.setState({
        title: appSettingParams.title,
        confidential: appSettingParams.confidential,
        globalLang: appSettingParams.globalLang,
        fileUpload: appSettingParams.fileUpload,
        siteUrl: appSettingParams.siteUrl,
        envSiteUrl: appSettingParams.envSiteUrl,
        isSetSiteUrl: !!appSettingParams.siteUrl,
      });

    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to fetch data'));
    }
  }

  /**
   * Change title
   */
  changeTitle(title) {
    this.setState({ title });
  }

  /**
   * Change confidential
   */
  changeConfidential(confidential) {
    this.setState({ confidential });
  }

  /**
   * Change globalLang
   */
  changeGlobalLang(globalLang) {
    this.setState({ globalLang });
  }

  /**
   * Change fileUpload
   */
  changeFileUpload(fileUpload) {
    this.setState({ fileUpload });
  }

  /**
   * Change site url
   */
  changeSiteUrl(siteUrl) {
    this.setState({ siteUrl });
  }

  /**
   * Update app setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updateAppSettingHandler() {
    const response = await this.appContainer.apiv3.put('/app-settings/app-setting', {
      title: this.state.title,
      confidential: this.state.confidential,
      globalLang: this.state.globalLang,
      fileUpload: this.state.fileUpload,
    });
    const { appSettingParams } = response.data;
    return appSettingParams;
  }


  /**
   * Update site url setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updateSiteUrlSettingHandler() {
    const response = await this.appContainer.apiv3.put('/app-settings/site-url-setting', {
      siteUrl: this.state.siteUrl,
    });
    const { appSettingParams } = response.data;
    return appSettingParams;
  }

}
