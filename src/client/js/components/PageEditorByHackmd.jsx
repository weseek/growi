import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

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
      isInitialized: false,
      isInitializing: false,
      // for error
      hasError: false,
      errorMessage: '',
      errorReason: '',
    };

    this.getHackmdUri = this.getHackmdUri.bind(this);
    this.startToEdit = this.startToEdit.bind(this);
    this.resumeToEdit = this.resumeToEdit.bind(this);
    this.onSaveWithShortcut = this.onSaveWithShortcut.bind(this);
    this.hackmdEditorChangeHandler = this.hackmdEditorChangeHandler.bind(this);
    this.penpalErrorOccuredHandler = this.penpalErrorOccuredHandler.bind(this);
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

    return this.hackmdEditor.getValue();
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
    }
    catch (err) {
      pageContainer.showErrorToastr(err);

      this.setState({
        hasError: true,
        errorMessage: 'GROWI server failed to connect to HackMD.',
        errorReason: err.toString(),
      });
    }

    this.setState({
      isInitialized: true,
      isInitializing: false,
    });
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
  async discardChanges() {
    const { pageContainer } = this.props;
    const { pageId } = pageContainer.state;

    try {
      const res = await this.props.appContainer.apiPost('/hackmd.discard', { pageId });

      if (!res.ok) {
        throw new Error(res.error);
      }

      this.props.pageContainer.setState({
        hasDraftOnHackmd: false,
        pageIdOnHackmd: res.pageIdOnHackmd,
        revisionIdHackmdSynced: res.revisionIdHackmdSynced,
      });
    }
    catch (err) {
      logger.error(err);
      pageContainer.showErrorToastr(err);
    }
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
    if (pageContainer.state.markdown === body) {
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

  penpalErrorOccuredHandler(error) {
    const { pageContainer } = this.props;

    pageContainer.showErrorToastr(error);

    this.setState({
      hasError: true,
      errorMessage: 'GROWI client failed to connect to GROWI agent for HackMD.',
      errorReason: error.toString(),
    });
  }

  renderPreInitContent() {
    const hackmdUri = this.getHackmdUri();
    const { pageContainer } = this.props;
    const {
      pageIdOnHackmd, revisionId, revisionIdHackmdSynced, remoteRevisionId, hasDraftOnHackmd,
    } = pageContainer.state;

    const isPageExistsOnHackmd = (pageIdOnHackmd != null);
    const isResume = isPageExistsOnHackmd && hasDraftOnHackmd;

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
      const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <p className="text-center"><strong>HackMD has unsaved draft.</strong></p>

          { isHackmdDocumentOutdated && (
            <div className="card border-warning">
              <div className="card-header bg-warning"><i className="icon-fw icon-info"></i> DRAFT MAY BE OUTDATED</div>
              <div className="card-body text-center">
                The current draft on HackMD is based on&nbsp;
                <a href={`?revision=${revisionIdHackmdSynced}`}><span className="label label-default">{revisionIdHackmdSynced.substr(-8)}</span></a>.

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link btn-view-outdated-draft p-0"
                    type="button"
                    disabled={this.state.isInitializing}
                    onClick={() => { return this.resumeToEdit() }}
                  >
                    View the outdated draft on HackMD
                  </button>
                </div>
              </div>
            </div>
          ) }

          { !isHackmdDocumentOutdated && (
            <div className="text-center hackmd-resume-button-container mb-3">
              <button
                className="btn btn-success btn-lg waves-effect waves-light"
                type="button"
                disabled={this.state.isInitializing}
                onClick={() => { return this.resumeToEdit() }}
              >
                <span className="btn-label"><i className="icon-control-end"></i></span>
                <span className="btn-text">Resume to edit with HackMD</span>
              </button>
            </div>
          ) }

          <div className="text-center hackmd-discard-button-container mb-3">
            <button
              className="btn btn-default btn-lg waves-effect waves-light"
              type="button"
              onClick={() => { return this.discardChanges() }}
            >
              <span className="btn-label"><i className="icon-control-start"></i></span>
              <span className="btn-text">Discard changes of HackMD</span>
            </button>
          </div>

        </div>
      );
    }
    /*
     * Start to edit
     */
    else {
      const isRevisionOutdated = revisionId !== remoteRevisionId;

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

  render() {
    const hackmdUri = this.getHackmdUri();
    const { pageContainer } = this.props;
    const {
      markdown, pageIdOnHackmd, hasDraftOnHackmd,
    } = pageContainer.state;

    const isPageExistsOnHackmd = (pageIdOnHackmd != null);
    const isResume = isPageExistsOnHackmd && hasDraftOnHackmd;

    let content;

    if (this.state.isInitialized) {
      content = (
        <HackmdEditor
          ref={(c) => { this.hackmdEditor = c }}
          hackmdUri={hackmdUri}
          pageIdOnHackmd={pageIdOnHackmd}
          initializationMarkdown={isResume ? null : markdown}
          onChange={this.hackmdEditorChangeHandler}
          onSaveWithShortcut={(document) => {
            this.onSaveWithShortcut(document);
          }}
          onPenpalErrorOccured={this.penpalErrorOccuredHandler}
        >
        </HackmdEditor>
      );
    }
    else {
      content = this.renderPreInitContent();
    }


    return (
      <div className="position-relative">

        {content}

        { this.state.hasError && (
          <div className="hackmd-error position-absolute d-flex flex-column justify-content-center align-items-center">
            <div className="white-box text-center">
              <h2 className="text-warning"><i className="icon-fw icon-exclamation"></i> HackMD Integration failed</h2>
              <h4>{this.state.errorMessage}</h4>
              <p className="well well-sm text-danger">
                {this.state.errorReason}
              </p>
              <p>
                Check your configuration following <a href="https://docs.growi.org/guide/admin-cookbook/integrate-with-hackmd.html">the manual</a>.
              </p>
            </div>
          </div>
        ) }

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
