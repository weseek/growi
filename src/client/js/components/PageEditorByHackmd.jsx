import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import EditorContainer from '../services/EditorContainer';

import { withUnstatedContainers } from './UnstatedUtils';
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
    const { t } = this.props;
    if (!this.state.isInitialized) {
      return Promise.reject(new Error(t('hackmd.not_initialized')));
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

  get isResume() {
    const { pageContainer } = this.props;
    const {
      pageIdOnHackmd, hasDraftOnHackmd, isHackmdDraftUpdatingInRealtime,
    } = pageContainer.state;

    const isPageExistsOnHackmd = (pageIdOnHackmd != null);
    return (isPageExistsOnHackmd && hasDraftOnHackmd) || isHackmdDraftUpdatingInRealtime;
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
    const { pageContainer, t } = this.props;

    pageContainer.showErrorToastr(error);

    this.setState({
      hasError: true,
      errorMessage: t('hackmd.fail_to_connect'),
      errorReason: error.toString(),
    });
  }

  renderPreInitContent() {
    const hackmdUri = this.getHackmdUri();
    const { pageContainer, t } = this.props;
    const {
      revisionId, revisionIdHackmdSynced, remoteRevisionId, pageId,
    } = pageContainer.state;
    const isPageNotFound = pageId == null;

    let content;

    /*
     * HackMD is not setup
     */
    if (hackmdUri == null) {
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> { t('hackmd.not_set_up')}</p>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('hackmd.need_to_associate_with_growi_to_use_hackmd_refer_to_this') }} />
        </div>
      );
    }

    /*
    * used HackMD from NotFound Page
    */
    else if (isPageNotFound) {
      content = (
        <div className="text-center">
          <p className="hackmd-status-label">
            <i className="fa fa-file-text mr-2" />
            { t('hackmd.used_for_not_found') }
          </p>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('hackmd.need_to_make_page') }} />
        </div>
      );
    }
    /*
     * Resume to edit or discard changes
     */
    else if (this.isResume) {
      const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <p className="text-center"><strong>{t('hackmd.unsaved_draft')}</strong></p>

          { isHackmdDocumentOutdated && (
            <div className="card border-warning">
              <div className="card-header bg-warning"><i className="icon-fw icon-info"></i> {t('hackmd.draft_outdated')}</div>
              <div className="card-body text-center">
                {t('hackmd.based_on_revision')}&nbsp;
                <a href={`?revision=${revisionIdHackmdSynced}`}><span className="badge badge-secondary">{revisionIdHackmdSynced.substr(-8)}</span></a>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link btn-view-outdated-draft p-0"
                    type="button"
                    disabled={this.state.isInitializing}
                    onClick={() => { return this.resumeToEdit() }}
                  >
                    {t('hackmd.view_outdated_draft')}
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
                <span className="btn-label"><i className="icon-fw icon-control-end"></i></span>
                <span className="btn-text">{t('hackmd.resume_to_edit')}</span>
              </button>
            </div>
          ) }

          <div className="text-center hackmd-discard-button-container mb-3">
            <button
              className="btn btn-outline-secondary btn-lg waves-effect waves-light"
              type="button"
              onClick={() => { return this.discardChanges() }}
            >
              <span className="btn-label"><i className="icon-fw icon-control-start"></i></span>
              <span className="btn-text">{t('hackmd.discard_changes')}</span>
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
          <p className="text-muted text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <div className="text-center hackmd-start-button-container mb-3">
            <button
              className="btn btn-info btn-lg waves-effect waves-light"
              type="button"
              disabled={isRevisionOutdated || this.state.isInitializing}
              onClick={() => { return this.startToEdit() }}
            >
              <span className="btn-label"><i className="icon-fw icon-paper-plane"></i></span>
              {t('hackmd.start_to_edit')}
            </button>
          </div>
          <p className="text-center">{t('hackmd.clone_page_content')}</p>
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
    const { pageContainer, t } = this.props;
    const {
      markdown, pageIdOnHackmd,
    } = pageContainer.state;


    let content;

    if (this.state.isInitialized) {
      content = (
        <HackmdEditor
          ref={(c) => { this.hackmdEditor = c }}
          hackmdUri={hackmdUri}
          pageIdOnHackmd={pageIdOnHackmd}
          initializationMarkdown={this.isResume ? null : markdown}
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
            <div className="bg-box p-5 text-center">
              <h2 className="text-warning"><i className="icon-fw icon-exclamation"></i> {t('hackmd.integration_failed')}</h2>
              <h4>{this.state.errorMessage}</h4>
              <p className="card well text-danger">
                {this.state.errorReason}
              </p>
              {/* eslint-disable-next-line react/no-danger */}
              <p dangerouslySetInnerHTML={{ __html: t('hackmd.check_configuration') }} />
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
const PageEditorByHackmdWrapper = withUnstatedContainers(PageEditorByHackmd, [AppContainer, PageContainer, EditorContainer]);

PageEditorByHackmd.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

export default withTranslation()(PageEditorByHackmdWrapper);
