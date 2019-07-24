import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import EditorContainer from '../../services/EditorContainer';
import { createSubscribedElement } from '../UnstatedUtils';
import HackmdEditor from '../PageEditorByHackmd/HackmdEditor';

import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../util/apiNotification'


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
      toastSuccess(`Import posts from esa success.`)
    } 
    catch (error) {
      toastError(`Error occurred in importing pages from esa.io`);
    }
  }

  esaHandleSubmitTest() {
    try {
      const params = {
      esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken,
      
    };
    this.props.appContainer.apiPost('/admin/import/testEsaAPI', params);
    toastSuccess(`Test connection to esa success.`)
    } catch (error) {
      toastError('Test connection to esa failed.');
    }
  }

  esaHandleSubmitUpdate() {
    try {
      const params = {
      esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken,
    };
    this.props.appContainer.apiPost('/admin/settings/importerEsa', params);
      toastSuccess(`Update`)
    } catch (error) {
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

          <div className="form-group">
            <input type="password" name="dummypass" style={{ display: 'none', top: '-100px', left: '-100px' }} />
          </div>

          <div className="form-group">
            <label>esaTeamName : </label>
            <input type="text" name="esaTeamName" value={esaTeamName} onChange={this.handleInputValue} />
          </div>

          <div className="form-group">
            <label>esaAccessToken : </label>
            <input type="password" name="esaAccessToken" value={esaAccessToken} onChange={this.handleInputValue} />
          </div>

          <div className="form-group">
            <input type="hidden" name="_csrf" value={this.props.csrf} />
            <div className="col-xs-offset-3 col-xs-6">


              <input name="Esa" type="button" id="testConnectionToEsa" className="btn btn-primary btn-esa" onClick={this.esaHandleSubmit} value="インポート" />

              <input name="Esa" type="button" id="testConnectionToEsa" className="btn btn-secondary" onClick={this.esaHandleSubmitUpdate} value="Update" />

              <span className="col-xs-offset-1">
                <input name="Esa" type="button" id="importFromEsa" className="btn btn-default btn-esa" onClick={this.esaHandleSubmitTest} value="接続テスト" name="Esa"
                    data-success-message="Test connection to esa success." data-error-message="Test connection to esa failed." />
              </span>
            </div>
          </div>

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