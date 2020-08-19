import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

import { toastSuccess, toastError } from '../util/apiNotification';

const logger = loggerFactory('growi:appSettings');

/**
 * Service container for admin app setting page (AppSettings.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminImportContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.dummyEsaTeamName = 0;
    this.dummyEsaTeamNameForError = 1;

    this.state = {
      retrieveError: null,
      // set dummy value tile for using suspense
      esaTeamName: this.dummyEsaTeamName,
      esaAccessToken: '',
      qiitaTeamName: '',
      qiitaAccessToken: '',
    };

    this.esaHandleSubmit = this.esaHandleSubmit.bind(this);
    this.esaHandleSubmitTest = this.esaHandleSubmitTest.bind(this);
    this.esaHandleSubmitUpdate = this.esaHandleSubmitUpdate.bind(this);
    this.qiitaHandleSubmit = this.qiitaHandleSubmit.bind(this);
    this.qiitaHandleSubmitTest = this.qiitaHandleSubmitTest.bind(this);
    this.qiitaHandleSubmitUpdate = this.qiitaHandleSubmitUpdate.bind(this);
    this.handleInputValue = this.handleInputValue.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminImportContainer';
  }

  /**
   * retrieve app sttings data
   */
  async retrieveImportSettingsData() {
    const response = await this.appContainer.apiv3.get('/import/');
    const {
      importSettingsParams,
    } = response.data;

    this.setState({
      esaTeamName: importSettingsParams.esaTeamName,
      esaAccessToken: importSettingsParams.esaAccessToken,
      qiitaTeamName: importSettingsParams.qiitaTeamName,
      qiitaAccessToken: importSettingsParams.qiitaAccessToken,
    });
  }

  handleInputValue(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  async esaHandleSubmit() {
    try {
      const params = {
        'importer:esa:team_name': this.state.esaTeamName,
        'importer:esa:access_token': this.state.esaAccessToken,
      };
      await this.appContainer.apiPost('/admin/import/esa', params);
      toastSuccess('Import posts from esa success.');
    }
    catch (err) {
      logger.error(err);
      toastError(err, 'Error occurred in importing pages from esa.io');
    }
  }

  async esaHandleSubmitTest() {
    try {
      const params = {
        'importer:esa:team_name': this.state.esaTeamName,
        'importer:esa:access_token': this.state.esaAccessToken,
      };
      await this.appContainer.apiPost('/admin/import/testEsaAPI', params);
      toastSuccess('Test connection to esa success.');
    }
    catch (error) {
      toastError(error, 'Test connection to esa failed.');
    }
  }

  async esaHandleSubmitUpdate() {
    const params = {
      'importer:esa:team_name': this.state.esaTeamName,
      'importer:esa:access_token': this.state.esaAccessToken,
    };
    try {
      await this.appContainer.apiPost('/admin/settings/importerEsa', params);
      toastSuccess('Updated');
    }
    catch (err) {
      logger.error(err);
      toastError(err, 'Errors');
    }
  }

  async qiitaHandleSubmit() {
    try {
      const params = {
        'importer:qiita:team_name': this.state.qiitaTeamName,
        'importer:qiita:access_token': this.state.qiitaAccessToken,
      };
      await this.appContainer.apiPost('/admin/import/qiita', params);
      toastSuccess('Import posts from qiita:team success.');
    }
    catch (err) {
      logger.error(err);
      toastError(err, 'Error occurred in importing pages from qiita:team');
    }
  }


  async qiitaHandleSubmitTest() {
    try {
      const params = {
        'importer:qiita:team_name': this.state.qiitaTeamName,
        'importer:qiita:access_token': this.state.qiitaAccessToken,
      };
      await this.appContainer.apiPost('/admin/import/testQiitaAPI', params);
      toastSuccess('Test connection to qiita:team success.');
    }
    catch (err) {
      logger.error(err);
      toastError(err, 'Test connection to qiita:team failed.');
    }
  }

  async qiitaHandleSubmitUpdate() {
    const params = {
      'importer:qiita:team_name': this.state.qiitaTeamName,
      'importer:qiita:access_token': this.state.qiitaAccessToken,
    };
    try {
      await this.appContainer.apiPost('/admin/settings/importerQiita', params);
      toastSuccess('Updated');
    }
    catch (err) {
      logger.error(err);
      toastError(err, 'Errors');
    }
  }

}
