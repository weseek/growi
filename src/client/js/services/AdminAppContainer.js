import { Container } from 'unstated';

/**
 * Service container for admin app setting page (AppSettings.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminAppContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.dummyTitle = 0;
    this.dummyTitleForError = 1;

    this.state = {
      retrieveError: null,
      // set dummy value tile for using suspense
      title: this.dummyTitle,
      confidential: '',
      globalLang: '',
      fileUpload: '',

      siteUrl: '',
      envSiteUrl: '',
      isSetSiteUrl: true,
      isMailerSetup: false,
      fromAddress: '',
      transmissionMethod: '',

      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      sesAccessKeyId: '',
      sesSecretAccessKey: '',

      fileUploadType: '',
      envFileUploadType: '',
      isFixedFileUploadByEnvVar: false,

      gcsUseOnlyEnvVars: false,
      gcsApiKeyJsonPath: '',
      envGcsApiKeyJsonPath: '',
      gcsBucket: '',
      envGcsBucket: '',
      gcsUploadNamespace: '',
      envGcsUploadNamespace: '',

      s3Region: '',
      s3CustomEndpoint: '',
      s3Bucket: '',
      s3AccessKeyId: '',
      s3SecretAccessKey: '',

      isEnabledPlugins: true,
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
      isMailerSetup: appSettingsParams.isMailerSetup,
      fromAddress: appSettingsParams.fromAddress,
      transmissionMethod: appSettingsParams.transmissionMethod,
      smtpHost: appSettingsParams.smtpHost,
      smtpPort: appSettingsParams.smtpPort,
      smtpUser: appSettingsParams.smtpUser,
      smtpPassword: appSettingsParams.smtpPassword,
      sesAccessKeyId: appSettingsParams.sesAccessKeyId,
      sesSecretAccessKey: appSettingsParams.sesSecretAccessKey,

      fileUploadType: appSettingsParams.fileUploadType,
      envFileUploadType: appSettingsParams.envFileUploadType,

      s3Region: appSettingsParams.s3Region,
      s3CustomEndpoint: appSettingsParams.s3CustomEndpoint,
      s3Bucket: appSettingsParams.s3Bucket,
      s3AccessKeyId: appSettingsParams.s3AccessKeyId,
      s3SecretAccessKey: appSettingsParams.s3SecretAccessKey,
      gcsUseOnlyEnvVars: appSettingsParams.gcsUseOnlyEnvVars,
      gcsApiKeyJsonPath: appSettingsParams.gcsApiKeyJsonPath,
      gcsBucket: appSettingsParams.gcsBucket,
      gcsUploadNamespace: appSettingsParams.gcsUploadNamespace,
      envGcsApiKeyJsonPath: appSettingsParams.envGcsApiKeyJsonPath,
      envGcsBucket: appSettingsParams.envGcsBucket,
      envGcsUploadNamespace: appSettingsParams.envGcsUploadNamespace,
      isEnabledPlugins: appSettingsParams.isEnabledPlugins,
    });

    // check is file upload type forced
    if (this.isFixedFileUploadByEnvVar(appSettingsParams.envFileUploadType)) {
      this.setState({ fileUploadType: appSettingsParams.envFileUploadType });
      this.setState({ isFixedFileUploadByEnvVar: true });
    }

  }

  /**
   * get isFixedFileUploadByEnvVar
   * @return {bool} isFixedFileUploadByEnvVar
   */
  isFixedFileUploadByEnvVar(envFileUploadType) {
    return envFileUploadType != null;
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
   * Change from transmission method
   */
  changeTransmissionMethod(transmissionMethod) {
    this.setState({ transmissionMethod });
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
   * Change s3Region
   */
  changeS3Region(s3Region) {
    this.setState({ s3Region });
  }

  /**
   * Change s3CustomEndpoint
   */
  changeS3CustomEndpoint(s3CustomEndpoint) {
    this.setState({ s3CustomEndpoint });
  }

  /**
   * Change fileUploadType
   */
  changeFileUploadType(fileUploadType) {
    this.setState({ fileUploadType });
  }

  /**
   * Change region
   */
  changeS3Bucket(s3Bucket) {
    this.setState({ s3Bucket });
  }

  /**
   * Change access key id
   */
  changeS3AccessKeyId(s3AccessKeyId) {
    this.setState({ s3AccessKeyId });
  }

  /**
   * Change secret access key
   */
  changeS3SecretAccessKey(s3SecretAccessKey) {
    this.setState({ s3SecretAccessKey });
  }

  /**
   * Change gcsApiKeyJsonPath
   */
  changeGcsApiKeyJsonPath(gcsApiKeyJsonPath) {
    this.setState({ gcsApiKeyJsonPath });
  }

  /**
   * Change gcsBucket
   */
  changeGcsBucket(gcsBucket) {
    this.setState({ gcsBucket });
  }

  /**
   * Change gcsUploadNamespace
   */
  changeGcsUploadNamespace(gcsUploadNamespace) {
    this.setState({ gcsUploadNamespace });
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
  updateMailSettingHandler() {
    if (this.state.transmissionMethod === 'smtp') {
      return this.updateSmtpSetting();
    }
    return this.updateSesSetting();
  }

  /**
   * Update smtp setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updateSmtpSetting() {
    const response = await this.appContainer.apiv3.put('/app-settings/smtp-setting', {
      fromAddress: this.state.fromAddress,
      transmissionMethod: this.state.transmissionMethod,
      smtpHost: this.state.smtpHost,
      smtpPort: this.state.smtpPort,
      smtpUser: this.state.smtpUser,
      smtpPassword: this.state.smtpPassword,
    });
    const { mailSettingParams } = response.data;
    this.setState({ isMailerSetup: mailSettingParams.isMailerSetup });
    return mailSettingParams;
  }

  /**
   * Update ses setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updateSesSetting() {
    const response = await this.appContainer.apiv3.put('/app-settings/ses-setting', {
      fromAddress: this.state.fromAddress,
      transmissionMethod: this.state.transmissionMethod,
      sesAccessKeyId: this.state.sesAccessKeyId,
      sesSecretAccessKey: this.state.sesSecretAccessKey,
    });
    const { mailSettingParams } = response.data;
    this.setState({ isMailerSetup: mailSettingParams.isMailerSetup });
    return mailSettingParams;
  }

  /**
   * send test e-mail
   * @memberOf AdminAppContainer
   */
  async sendTestEmail() {
    return this.appContainer.apiv3.post('/app-settings/smtp-test');
  }

  /**
   * Update file upload setting
   * @memberOf AdminAppContainer
   */
  updateFileUploadSettingHandler() {
    if (this.state.fileUploadType === 'aws') {
      return this.updateAwsSettingHandler();
    }
    return this.updateGcsSettingHandler();
  }

  /**
   * Update AWS setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updateAwsSettingHandler() {
    const response = await this.appContainer.apiv3.put('/app-settings/aws-setting', {
      fileUploadType: this.state.fileUploadType,
      s3Region: this.state.s3Region,
      s3CustomEndpoint: this.state.s3CustomEndpoint,
      s3Bucket: this.state.s3Bucket,
      s3AccessKeyId: this.state.s3AccessKeyId,
      s3SecretAccessKey: this.state.s3SecretAccessKey,
    });
    const { awsSettingParams } = response.data;
    return awsSettingParams;
  }

  /**
   * Update GCS setting
   * @memberOf AdminAppContainer
   * @return {Array} Appearance
   */
  async updateGcsSettingHandler() {
    const response = await this.appContainer.apiv3.put('/app-settings/gcs-setting', {
      fileUploadType: this.state.fileUploadType,
      gcsApiKeyJsonPath: this.state.gcsApiKeyJsonPath,
      gcsBucket: this.state.gcsBucket,
      gcsUploadNamespace: this.state.gcsUploadNamespace,
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
