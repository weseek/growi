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
      retrieveError: null,
      title: '',
      confidential: '',
      globalLang: '',
      fileUpload: '',
      siteUrl: '',
      envSiteUrl: '',
      isSetSiteUrl: true,
      fromAddress: '',
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      region: '',
      customEndpoint: '',
      bucket: '',
      accessKeyId: '',
      secretAccessKey: '',
      isEnabledPlugins: true,
    };

    this.changeTitle = this.changeTitle.bind(this);
    this.changeConfidential = this.changeConfidential.bind(this);
    this.changeGlobalLang = this.changeGlobalLang.bind(this);
    this.changeFileUpload = this.changeFileUpload.bind(this);
    this.changeSiteUrl = this.changeSiteUrl.bind(this);
    this.changeFromAddress = this.changeFromAddress.bind(this);
    this.changeSmtpHost = this.changeSmtpHost.bind(this);
    this.changeSmtpPort = this.changeSmtpPort.bind(this);
    this.changeSmtpUser = this.changeSmtpUser.bind(this);
    this.changeSmtpPassword = this.changeSmtpPassword.bind(this);
    this.changeRegion = this.changeRegion.bind(this);
    this.changeCustomEndpoint = this.changeCustomEndpoint.bind(this);
    this.changeBucket = this.changeBucket.bind(this);
    this.changeAccessKeyId = this.changeAccessKeyId.bind(this);
    this.changeSecretAccessKey = this.changeSecretAccessKey.bind(this);
    this.changeIsEnabledPlugins = this.changeIsEnabledPlugins.bind(this);
    this.updateAppSettingHandler = this.updateAppSettingHandler.bind(this);
    this.updateSiteUrlSettingHandler = this.updateSiteUrlSettingHandler.bind(this);
    this.updateMailSettingHandler = this.updateMailSettingHandler.bind(this);
    this.updateAwsSettingHandler = this.updateAwsSettingHandler.bind(this);
    this.updatePluginSettingHandler = this.updatePluginSettingHandler.bind(this);
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
      const { appSettingsParams } = response.data;

      this.setState({
        title: appSettingsParams.title,
        confidential: appSettingsParams.confidential,
        globalLang: appSettingsParams.globalLang,
        fileUpload: appSettingsParams.fileUpload,
        siteUrl: appSettingsParams.siteUrl,
        envSiteUrl: appSettingsParams.envSiteUrl,
        isSetSiteUrl: !!appSettingsParams.siteUrl,
        fromAddress: appSettingsParams.fromAddress,
        smtpHost: appSettingsParams.smtpHost,
        smtpPort: appSettingsParams.smtpPort,
        smtpUser: appSettingsParams.smtpUser,
        smtpPassword: appSettingsParams.smtpPassword,
        region: appSettingsParams.region,
        customEndpoint: appSettingsParams.customEndpoint,
        bucket: appSettingsParams.bucket,
        accessKeyId: appSettingsParams.accessKeyId,
        secretAccessKey: appSettingsParams.secretAccessKey,
        isEnabledPlugins: appSettingsParams.isEnabledPlugins,
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
   * Change from address
   */
  changeFromAddress(fromAddress) {
    this.setState({ fromAddress });
  }

  /**
   * Change smtp host
   */
  changeSmtpHost(smtpHost) {
    this.setState({ smtpHost });
  }

  /**
   * Change smtp port
   */
  changeSmtpPort(smtpPort) {
    this.setState({ smtpPort });
  }

  /**
   * Change smtp user
   */
  changeSmtpUser(smtpUser) {
    this.setState({ smtpUser });
  }

  /**
   * Change smtp password
   */
  changeSmtpPassword(smtpPassword) {
    this.setState({ smtpPassword });
  }

  /**
   * Change region
   */
  changeRegion(region) {
    this.setState({ region });
  }

  /**
   * Change custom endpoint
   */
  changeCustomEndpoint(customEndpoint) {
    this.setState({ customEndpoint });
  }

  /**
   * Change bucket name
   */
  changeBucket(bucket) {
    this.setState({ bucket });
  }

  /**
   * Change access key id
   */
  changeAccessKeyId(accessKeyId) {
    this.setState({ accessKeyId });
  }

  /**
   * Change secret access key
   */
  changeSecretAccessKey(secretAccessKey) {
    this.setState({ secretAccessKey });
  }

  /**
   * Change secret key
   */
  changeIsEnabledPlugins(isEnabledPlugins) {
    this.setState({ isEnabledPlugins });
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
    const { siteUrlSettingParams } = response.data;
    return siteUrlSettingParams;
  }

  /**
   * Update mail setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updateMailSettingHandler() {
    const response = await this.appContainer.apiv3.put('/app-settings/mail-setting', {
      fromAddress: this.state.fromAddress,
      smtpHost: this.state.smtpHost,
      smtpPort: this.state.smtpPort,
      smtpUser: this.state.smtpUser,
      smtpPassword: this.state.smtpPassword,
    });
    const { mailSettingParams } = response.data;
    return mailSettingParams;
  }

  /**
   * Update AWS setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updateAwsSettingHandler() {
    const response = await this.appContainer.apiv3.put('/app-settings/aws-setting', {
      region: this.state.region,
      customEndpoint: this.state.customEndpoint,
      bucket: this.state.bucket,
      accessKeyId: this.state.accessKeyId,
      secretAccessKey: this.state.secretAccessKey,
    });
    const { awsSettingParams } = response.data;
    return awsSettingParams;
  }

  /**
   * Update plugin setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updatePluginSettingHandler() {
    const response = await this.appContainer.apiv3.put('/app-settings/plugin-setting', {
      isEnabledPlugins: this.state.isEnabledPlugins,
    });
    const { pluginSettingParams } = response.data;
    return pluginSettingParams;
  }


}
