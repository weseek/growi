import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import AppContainer from '../../services/AppContainer';
import { createSubscribedElement } from '../UnstatedUtils';
import { toastSuccess, toastError } from '../../util/apiNotification';

class Importer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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
      await this.props.appContainer.apiPost('/admin/import/esa', params);
      toastSuccess('Import posts from esa success.');
    }
    catch (error) {
      toastError(error, 'Error occurred in importing pages from esa.io');
    }
  }

  async esaHandleSubmitTest() {
    try {
      const params = {
        'importer:esa:team_name': this.state.esaTeamName,
        'importer:esa:access_token': this.state.esaAccessToken,
      };
      await this.props.appContainer.apiPost('/admin/import/testEsaAPI', params);
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
      await this.props.appContainer.apiPost('/admin/settings/importerEsa', params);
      toastSuccess('Updated');
    }
    catch (err) {
      console.log(err.message);
      toastError(err, 'Errors');
    }
  }

  async qiitaHandleSubmit() {
    try {
      const params = {
        'importer:qiita:team_name': this.state.qiitaTeamName,
        'importer:qiita:access_token': this.state.qiitaAccessToken,
      };
      await this.props.appContainer.apiPost('/admin/import/qiita', params);
      toastSuccess('Import posts from qiita:team success.');
    }
    catch (error) {
      toastError(error, 'Error occurred in importing pages from qiita:team');
    }
  }


  async qiitaHandleSubmitTest() {
    try {
      const params = {
        'importer:qiita:team_name': this.state.qiitaTeamName,
        'importer:qiita:access_token': this.state.qiitaAccessToken,
      };
      await this.props.appContainer.apiPost('/admin/import/testQiitaAPI', params);
      toastSuccess('Test connection to qiita:team success.');
    }
    catch (error) {
      toastError(error, 'Test connection to qiita:team failed.');
    }
  }

  async qiitaHandleSubmitUpdate() {
    const params = {
      'importer:qiita:team_name': this.state.qiitaTeamName,
      'importer:qiita:access_token': this.state.qiitaAccessToken,
    };
    try {
      await this.props.appContainer.apiPost('/admin/settings/importerQiita', params);
      toastSuccess('Updated');
    }
    catch (err) {
      console.log(err.message);
      toastError(err, 'Errors');
    }
  }

  render() {
    const {
      esaTeamName, esaAccessToken, qiitaTeamName, qiitaAccessToken,
    } = this.state;
    const { t } = this.props;
    return (
      <Fragment>
        <form
          className="form-horizontal"
          id="importerSettingFormEsa"
          role="form"
        >
          <fieldset>
            <legend>{ t('importer_management.import_form_esa') }</legend>
            <table className="table table-bordered table-mapping">
              <thead>
                <tr>
                  <th width="45%">esa.io</th>
                  <th width="10%"></th>
                  <th>GROWI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{ t('Article') }</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{ t('Page') }</th>
                </tr>
                <tr>
                  <th>{ t('Category') }</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{ t('Page Path') }</th>
                </tr>
                <tr>
                  <th>{ t('User') }</th>
                  <th></th>
                  <th>(TBD)</th>
                </tr>
              </tbody>
            </table>

            <div className="well well-sm mb-0 small">
              <ul>
                <li>{ t('importer_management.page_skip') }</li>
              </ul>
            </div>

            <div className="form-group">
              <input type="password" name="dummypass" style={{ display: 'none', top: '-100px', left: '-100px' }} />
            </div>

            <div className="form-group">
              <label htmlFor="settingForm[importer:esa:team_name]" className="col-xs-3 control-label">
                { t('importer_management.esa_settings.team_name') }
              </label>
              <div className="col-xs-6">
                <input className="form-control" type="text" name="esaTeamName" value={esaTeamName} onChange={this.handleInputValue} />
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="settingForm[importer:esa:access_token]" className="col-xs-3 control-label">
                { t('importer_management.esa_settings.access_token') }
              </label>
              <div className="col-xs-6">
                <input className="form-control" type="password" name="esaAccessToken" value={esaAccessToken} onChange={this.handleInputValue} />
              </div>
            </div>

            <div className="form-group">
              <div className="col-xs-offset-3 col-xs-6">
                <input
                  id="testConnectionToEsa"
                  type="button"
                  className="btn btn-primary btn-esa"
                  name="Esa"
                  onClick={this.esaHandleSubmit}
                  value={t('importer_management.import')}
                />
                <input type="button" className="btn btn-secondary" onClick={this.esaHandleSubmitUpdate} value={t('Update')} />
                <span className="col-xs-offset-1">
                  <input
                    name="Esa"
                    type="button"
                    id="importFromEsa"
                    className="btn btn-default btn-esa"
                    onClick={this.esaHandleSubmitTest}
                    value={t('importer_management.esa_settings.test_connection')}
                  />
                </span>

              </div>
            </div>
          </fieldset>
        </form>

        <form
          className="form-horizontal mt-5"
          id="importerSettingFormQiita"
          role="form"
        >
          <fieldset>
            <legend>{ t('importer_management.import_form_qiita', 'Qiita:Team') }</legend>
            <table className="table table-bordered table-mapping">
              <thead>
                <tr>
                  <th width="45%">Qiita:Team</th>
                  <th width="10%"></th>
                  <th>GROWI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{ t('Article') }</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{ t('Page') }</th>
                </tr>
                <tr>
                  <th>{ t('Tag')}</th>
                  <th></th>
                  <th>-</th>
                </tr>
                <tr>
                  <th>{ t('importer_management.Directory_hierarchy_tag') }</th>
                  <th></th>
                  <th>(TBD)</th>
                </tr>
                <tr>
                  <th>{ t('User') }</th>
                  <th></th>
                  <th>(TBD)</th>
                </tr>
              </tbody>
            </table>
            <div className="well well-sm mb-0 small">
              <ul>
                <li>{ t('importer_management.page_skip') }</li>
              </ul>
            </div>

            <div className="form-group">
              <input type="password" name="dummypass" style={{ display: 'none', top: '-100px', left: '-100px' }} />
            </div>
            <div className="form-group">
              <label htmlFor="settingForm[importer:qiita:team_name]" className="col-xs-3 control-label">
                { t('importer_management.qiita_settings.team_name') }
              </label>
              <div className="col-xs-6">
                <input className="form-control" type="text" name="qiitaTeamName" value={qiitaTeamName} onChange={this.handleInputValue} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settingForm[importer:qiita:access_token]" className="col-xs-3 control-label">
                { t('importer_management.qiita_settings.access_token') }
              </label>
              <div className="col-xs-6">
                <input className="form-control" type="password" name="qiitaAccessToken" value={qiitaAccessToken} onChange={this.handleInputValue} />
              </div>
            </div>


            <div className="form-group">
              <div className="col-xs-offset-3 col-xs-6">
                <input
                  id="testConnectionToQiita"
                  type="button"
                  className="btn btn-primary btn-qiita"
                  name="Qiita"
                  onClick={this.qiitaHandleSubmit}
                  value={t('importer_management.import')}
                />
                <input type="button" className="btn btn-secondary" onClick={this.qiitaHandleSubmitUpdate} value={t('Update')} />
                <span className="col-xs-offset-1">
                  <input
                    name="Qiita"
                    type="button"
                    id="importFromQiita"
                    className="btn btn-default btn-qiita"
                    onClick={this.qiitaHandleSubmitTest}
                    value={t('importer_management.qiita_settings.test_connection')}
                  />
                </span>

              </div>
            </div>


          </fieldset>


        </form>
      </Fragment>

    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ImporterWrapper = (props) => {
  return createSubscribedElement(Importer, props, [AppContainer]);
};

Importer.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(ImporterWrapper);
