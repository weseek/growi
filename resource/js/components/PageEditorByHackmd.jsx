import React from 'react';
import PropTypes from 'prop-types';

import * as toastr from 'toastr';

import HackmdEditor from './PageEditorByHackmd/HackmdEditor';

export default class PageEditorByHackmd extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isInitialized: false,
      isInitializing: false,
      pageIdOnHackmd: this.props.pageIdOnHackmd,
    };

    this.getHackmdUri = this.getHackmdUri.bind(this);
    this.startToEdit = this.startToEdit.bind(this);
    this.resumeToEdit = this.resumeToEdit.bind(this);

    this.apiErrorHandler = this.apiErrorHandler.bind(this);
  }

  componentWillMount() {
  }

  getHackmdUri() {
    const envVars = this.props.crowi.config.env;
    return envVars.HACKMD_URI;
  }

  /**
   * Start integration with HackMD
   */
  startToEdit() {
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
      pageId: this.props.pageId,
    };
    this.props.crowi.apiPost('/hackmd.integrate', params)
      .then(res => {
        if (!res.ok) {
          throw new Error(res.error);
        }

        this.setState({
          isInitialized: true,
          pageIdOnHackmd: res.pageIdOnHackmd,
          revisionIdHackmdSynced: res.revisionIdHackmdSynced,
        });
      })
      .catch(this.apiErrorHandler)
      .then(() => {
        this.setState({isInitializing: false});
      });
  }

  /**
   * Start to edit w/o any api request
   */
  resumeToEdit() {
    this.setState({isInitialized: true});
  }

  apiErrorHandler(error) {
    toastr.error(error.message, 'Error occured', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  }

  render() {
    const hackmdUri = this.getHackmdUri();

    if (this.state.isInitialized) {
      return (
        <HackmdEditor
          markdown={this.props.markdown}
          hackmdUri={hackmdUri}
          pageIdOnHackmd={this.state.pageIdOnHackmd}
        >
        </HackmdEditor>
      );
    }

    let content = undefined;
    const isPageExistsOnHackmd = (this.state.pageIdOnHackmd != null);
    const isRevisionMatch = (this.props.revisionId === this.props.revisionIdHackmdSynced);

    // HackMD is not setup
    if (hackmdUri == null) {
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is not set up.</p>
        </div>
      );
    }
    // page is exists, revisions are match, hasDraftOnHackmd is true
    else if (isPageExistsOnHackmd && isRevisionMatch && this.props.hasDraftOnHackmd) {
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <p className="text-center">
            <button className="btn btn-success btn-lg waves-effect waves-light" type="button"
                onClick={() => this.resumeToEdit()}>
              <span className="btn-label"><i className="icon-control-end"></i></span>
              Resume to edit with HackMD
            </button>
          </p>
          <p className="text-center">Click to edit from the previous continuation.</p>
        </div>
      );
    }
    else {
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <p className="text-center">
            <button className="btn btn-info btn-lg waves-effect waves-light" type="button"
                onClick={() => this.startToEdit()} disabled={this.state.isInitializing}>
              <span className="btn-label"><i className="icon-paper-plane"></i></span>
              Start to edit with HackMD
            </button>
          </p>
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

PageEditorByHackmd.propTypes = {
  crowi: PropTypes.object.isRequired,
  markdown: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  pageIdOnHackmd: PropTypes.string,
  revisionIdHackmdSynced: PropTypes.string,
  hasDraftOnHackmd: PropTypes.bool,
};
