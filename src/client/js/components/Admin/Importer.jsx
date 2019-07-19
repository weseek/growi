import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import EditorContainer from '../../services/EditorContainer';
import { createSubscribedElement } from '../UnstatedUtils';
import HackmdEditor from '../PageEditorByHackmd/HackmdEditor';


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
    this.handleInputValue = this.handleInputValue.bind(this);
  }

  handleInputValue(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  esaHandleSubmit() {
    const params = {
      esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken,
    };
    this.props.appContainer.apiPost('/admin/import/esa', params);
  }

  esaHandleSubmitTest() {
    const params = {
      esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken,
    };
    this.props.appContainer.apiPost('/admin/import/testEsaAPI', params);
  }

  render() {
    const { esaTeamName, esaAccessToken } = this.state;
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
              <button type="submit" className="btn btn-secondary">{ // the first element is the default button to submit
              }
                {'Update'}
              </button>
              <span className="col-xs-offset-1">
                <input name="Esa" type="button" id="importFromEsa" className="btn btn-default btn-esa" onClick={this.esaHandleSubmitTest} value="接続テスト" />
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
};

export default ImporterWrapper;
