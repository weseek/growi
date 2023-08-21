import { isServer } from '@growi/core/dist/utils';
import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

import { apiPost } from '../util/apiv1-client';
import { apiv3Get } from '../util/apiv3-client';
import { toastSuccess, toastError } from '../util/toastr';

const logger = loggerFactory('growi:appSettings');

/**
 * Service container for admin app setting page (AppSettings.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminImportContainer extends Container {

  constructor(appContainer) {
    super();

    if (isServer()) {
      return;
    }

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      esaTeamName: '',
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
    const response = await apiv3Get('/import/');
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
      await apiPost('/admin/import/esa', params);
      toastSuccess('Import posts from esa success.');
    }
    catch (err) {
      logger.error(err);
      toastError(err);
    }
  }

  async esaHandleSubmitTest() {
    try {
      const params = {
        'importer:esa:team_name': this.state.esaTeamName,
        'importer:esa:access_token': this.state.esaAccessToken,
      };
      await apiPost('/admin/import/testEsaAPI', params);
      toastSuccess('Test connection to esa success.');
    }
    catch (error) {
      toastError(error);
    }
  }

  async esaHandleSubmitUpdate() {
    const params = {
      'importer:esa:team_name': this.state.esaTeamName,
      'importer:esa:access_token': this.state.esaAccessToken,
    };
    try {
      await apiPost('/admin/settings/importerEsa', params);
      toastSuccess('Updated');
    }
    catch (err) {
      logger.error(err);
      toastError(err);
    }
  }

  async qiitaHandleSubmit() {
    try {
      const params = {
        'importer:qiita:team_name': this.state.qiitaTeamName,
        'importer:qiita:access_token': this.state.qiitaAccessToken,
      };
      await apiPost('/admin/import/qiita', params);
      toastSuccess('Import posts from qiita:team success.');
    }
    catch (err) {
      logger.error(err);
      toastError(err);
    }
  }


  async qiitaHandleSubmitTest() {
    try {
      const params = {
        'importer:qiita:team_name': this.state.qiitaTeamName,
        'importer:qiita:access_token': this.state.qiitaAccessToken,
      };
      await apiPost('/admin/import/testQiitaAPI', params);
      toastSuccess('Test connection to qiita:team success.');
    }
    catch (err) {
      logger.error(err);
      toastError(err);
    }
  }

  async qiitaHandleSubmitUpdate() {
    const params = {
      'importer:qiita:team_name': this.state.qiitaTeamName,
      'importer:qiita:access_token': this.state.qiitaAccessToken,
    };
    try {
      await apiPost('/admin/settings/importerQiita', params);
      toastSuccess('Updated');
    }
    catch (err) {
      logger.error(err);
      toastError(err);
    }
  }

}
