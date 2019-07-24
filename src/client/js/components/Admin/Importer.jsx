import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import EditorContainer from '../../services/EditorContainer';
import { createSubscribedElement } from '../UnstatedUtils';
import HackmdEditor from '../PageEditorByHackmd/HackmdEditor';


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
    this.handleInputValue = this.handleInputValue.bind(this);
  }

  handleInputValue(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  esaHandleSubmit() {
    try {
      const params = {
        esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken,
      };
      this.props.appContainer.apiPost('/admin/import/esa', params);
      toastSuccess('Import posts from esa success.');
    }
    catch (error) {
      toastError('Error occurred in importing pages from esa.io');
    }
  }

  esaHandleSubmitTest() {
    try {
      const params = {
        esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken,

      };
      this.props.appContainer.apiPost('/admin/import/testEsaAPI', params);
      toastSuccess('Test connection to esa success.');
    }
    catch (error) {
      toastError('Test connection to esa failed.');
    }
  }

  esaHandleSubmitUpdate() {
    try {
      const params = {
        esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken,
      };
      this.props.appContainer.apiPost('/admin/settings/importerEsa', params);
      toastSuccess('Update');
    }
    catch (error) {
      toastError(err);
    }
  }

  render() {
    const { esaTeamName, esaAccessToken } = this.state;
    const { t } = this.props;
    return (
      <Fragment>
        <form
          action="/_api/admin/settings/importerEsa"
          className="form-horizontal"
          id="importerSettingFormEsa"
          role="form"
          data-success-messaage="{{ ('Updated') }}"
        >
          <fieldset>
            <legend>{ t('importer_management.import_from_esa') }</legend>
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
                <input className="form-control" type="text" name="settingForm[importer:esa:team_name]" value={esaTeamName} onChange={this.handleInputValue} />
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="settingForm[importer:esa:access_token]" className="col-xs-3 control-label">
                { t('importer_management.esa_settings.access_token') }
              </label>
              <div className="col-xs-6">
                <input className="form-control" type="password" name="settingForm[importer:esa:access_token]" value={esaAccessToken} onChange={this.handleInputValue} />
              </div>
            </div>

            <div className="form-group">
              <input type="hidden" name="_csrf" value={this.props.csrf} />
              <div className="col-xs-offset-3 col-xs-6">

                <input id="testConnectionToEsa" type="button" className="btn btn-primary btn-esa" name="Esa" onClick={this.esaHandleSubmit} value="インポート" />

                <input name="Esa" type="submit" className="btn btn-secondary" onClick={this.esaHandleSubmitUpdate} value="Update" />

                <span className="col-xs-offset-1">
                  <input name="Esa" type="button" id="importFromEsa" className="btn btn-default btn-esa" onClick={this.esaHandleSubmitTest} value="接続テスト" name="Esa" />
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
  return createSubscribedElement(Importer, props, [AppContainer, PageContainer, EditorContainer]);
};

Importer.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(ImporterWrapper);
