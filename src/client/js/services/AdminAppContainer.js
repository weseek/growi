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


  inputTitleChangeHandler(event) {
    this.setState({ title: event.target.value });
  }

  inputConfidentialChangeHandler(event) {
    this.setState({ confidential: event.target.value });
  }

  inputGlobalLangChangeHandler(event) {
    this.setState({ globalLang: event.target.value });
  }

  inputFileUploadChangeHandler(event) {
    this.setState({ fileUpload: event.target.checked });
  }

}
