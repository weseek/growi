import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import SplitButton from 'react-bootstrap/es/SplitButton';
import MenuItem from 'react-bootstrap/es/MenuItem';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import EditorContainer from '../services/EditorContainer';

import { createSubscribedElement } from './UnstatedUtils';
import HackmdEditor from './PageEditorByHackmd/HackmdEditor';

const logger = loggerFactory('growi:PageEditorByHackmd');

class PageEditorByHackmd extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      markdown: this.props.pageContainer.state.markdown,
      isInitialized: false,
      isInitializing: false,
    };

    this.getHackmdUri = this.getHackmdUri.bind(this);
    this.startToEdit = this.startToEdit.bind(this);
    this.resumeToEdit = this.resumeToEdit.bind(this);
    this.onSaveWithShortcut = this.onSaveWithShortcut.bind(this);
    this.hackmdEditorChangeHandler = this.hackmdEditorChangeHandler.bind(this);
  }

  componentWillMount() {
    this.props.appContainer.registerComponentInstance('PageEditorByHackmd', this);
  }

  /**
   * return markdown document of HackMD
   * @return {Promise<string>}
   */
  getMarkdown() {
    if (!this.state.isInitialized) {
      return Promise.reject(new Error('HackmdEditor component has not initialized'));
    }

    return this.hackmdEditor.getValue()
      .then((document) => {
        this.setState({ markdown: document });
        return document;
      });
  }

  /**
   * reset initialized status
   */
  reset() {
    this.setState({ isInitialized: false });
  }

  getHackmdUri() {
    const envVars = this.props.appContainer.getConfig().env;
    return envVars.HACKMD_URI;
  }

  /**
   * Start integration with HackMD
   */
  async startToEdit() {
    const { pageContainer } = this.props;
    const hackmdUri = this.getHackmdUri();

    if (hackmdUri == null) {
      // do nothing
      return;
    }

    this.setState({
      isInitialized: false,
      isInitializing: true,
    });

    const params = {
      pageId: pageContainer.state.pageId,
    };

    try {
      const res = await this.props.appContainer.apiPost('/hackmd.integrate', params);

      if (!res.ok) {
        throw new Error(res.error);
      }

      await pageContainer.setState({
        pageIdOnHackmd: res.pageIdOnHackmd,
        revisionIdHackmdSynced: res.revisionIdHackmdSynced,
      });
      this.setState({
        isInitialized: true,
      });
    }
    catch (err) {
      pageContainer.showErrorToastr(err);
    }

    this.setState({ isInitializing: false });
  }

  /**
   * Start to edit w/o any api request
   */
  resumeToEdit() {
    this.setState({ isInitialized: true });
  }

  /**
   * Reset draft
   */
  discardChanges() {
    this.props.pageContainer.setState({ hasDraftOnHackmd: false });
  }

  /**
   * save and update state of containers
   * @param {string} markdown
   */
  async onSaveWithShortcut(markdown) {
    const { pageContainer, editorContainer } = this.props;
    const optionsToSave = editorContainer.getCurrentOptionsToSave();

    try {
      // disable unsaved warning
      editorContainer.disableUnsavedWarning();

      // eslint-disable-next-line no-unused-vars
      const { page, tags } = await pageContainer.save(markdown, optionsToSave);
      logger.debug('success to save');

      pageContainer.showSuccessToastr();

      // update state of EditorContainer
      editorContainer.setState({ tags });
    }
    catch (error) {
      logger.error('failed to save', error);
      pageContainer.showErrorToastr(error);
    }
  }

  /**
   * onChange event of HackmdEditor handler
   */
  async hackmdEditorChangeHandler(body) {
    const hackmdUri = this.getHackmdUri();
    const { pageContainer, editorContainer } = this.props;

    if (hackmdUri == null) {
      // do nothing
      return;
    }

    // do nothing if contents are same
    if (this.state.markdown === body) {
      return;
    }

    // enable unsaved warning
    editorContainer.enableUnsavedWarning();

    const params = {
      pageId: pageContainer.state.pageId,
    };
    try {
      await this.props.appContainer.apiPost('/hackmd.saveOnHackmd', params);
    }
    catch (err) {
      logger.error(err);
    }
  }

  render() {
    const hackmdUri = this.getHackmdUri();
    const { pageContainer } = this.props;
    const {
      pageIdOnHackmd, revisionId, revisionIdHackmdSynced, remoteRevisionId, hasDraftOnHackmd,
    } = pageContainer.state;

    const isPageExistsOnHackmd = (pageIdOnHackmd != null);
    const isResume = isPageExistsOnHackmd && hasDraftOnHackmd;

    if (this.state.isInitialized) {
      return (
        <HackmdEditor
          ref={(c) => { this.hackmdEditor = c }}
          hackmdUri={hackmdUri}
          pageIdOnHackmd={pageIdOnHackmd}
          initializationMarkdown={isResume ? null : this.state.markdown}
          onChange={this.hackmdEditorChangeHandler}
          onSaveWithShortcut={(document) => {
            this.onSaveWithShortcut(document);
          }}
        >
        </HackmdEditor>
      );
    }

    const isRevisionOutdated = revisionId !== remoteRevisionId;
    const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

    let content;
    /*
     * HackMD is not setup
     */
    if (hackmdUri == null) {
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is not set up.</p>
        </div>
      );
    }
    /*
     * Resume to edit or discard changes
     */
    else if (isResume) {
      const title = (
        <React.Fragment>
          <span className="btn-label"><i className="icon-control-end"></i></span>
          Resume to edit with HackMD
        </React.Fragment>
      );
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <div className="text-center hackmd-resume-button-container mb-3">
            <SplitButton
              id="split-button-resume-hackmd"
              title={title}
              bsStyle="success"
              bsSize="large"
              className="btn-resume waves-effect waves-light"
              onClick={() => { return this.resumeToEdit() }}
            >
              <MenuItem className="text-center" onClick={() => { return this.discardChanges() }}>
                <i className="icon-control-rewind"></i> Discard changes
              </MenuItem>
            </SplitButton>
          </div>
          <p className="text-center">
            Click to edit from the previous continuation<br />
            or
            <button
              type="button"
              className="btn btn-link text-danger p-0 hackmd-discard-button"
              onClick={() => { return this.discardChanges() }}
            >
              Discard changes
            </button>.
          </p>
          { isHackmdDocumentOutdated
            && (
            <div className="panel panel-warning mt-5">
              <div className="panel-heading"><i className="icon-fw icon-info"></i> DRAFT MAY BE OUTDATED</div>
              <div className="panel-body text-center">
                The current draft on HackMD is based on&nbsp;
                <a href={`?revision=${revisionIdHackmdSynced}`}><span className="label label-default">{revisionIdHackmdSynced.substr(-8)}</span></a>.<br />
                <button
                  type="button"
                  className="btn btn-link text-danger p-0 hackmd-discard-button"
                  onClick={() => { return this.discardChanges() }}
                >
                  Discard it
                </button> to start to edit with current revision.
              </div>
            </div>
            )
          }
        </div>
      );
    }
    /*
     * Start to edit
     */
    else {
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <div className="text-center hackmd-start-button-container mb-3">
            <button
              className="btn btn-info btn-lg waves-effect waves-light"
              type="button"
              disabled={isRevisionOutdated || this.state.isInitializing}
              onClick={() => { return this.startToEdit() }}
            >
              <span className="btn-label"><i className="icon-paper-plane"></i></span>
              Start to edit with HackMD
            </button>
          </div>
          <p className="text-center">Click to clone page content and start to edit.</p>
        </div>
      );
    }

    return (
      <div className="hackmd-preinit d-flex justify-content-center align-items-center">
        {content}
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PageEditorByHackmdWrapper = (props) => {
  return createSubscribedElement(PageEditorByHackmd, props, [AppContainer, PageContainer, EditorContainer]);
};

PageEditorByHackmd.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

export default PageEditorByHackmdWrapper;
