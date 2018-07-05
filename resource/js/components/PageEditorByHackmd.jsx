import React from 'react';
import PropTypes from 'prop-types';

import * as toastr from 'toastr';

import HackmdEditor from './PageEditorByHackmd/HackmdEditor';

export default class PageEditorByHackmd extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isInitializing: false,
      pageIdOnHackmd: this.props.pageIdOnHackmd,
    };

    this.getHackmdUri = this.getHackmdUri.bind(this);
    this.startIntegrationWithHackmd = this.startIntegrationWithHackmd.bind(this);

    this.apiErrorHandler = this.apiErrorHandler.bind(this);
  }

  componentWillMount() {
  }

  getHackmdUri() {
    const envVars = this.props.crowi.config.env;
    return envVars.HACKMD_URI;
  }

  syncToLatestRevision() {

  }

  /**
   * Start integration with HackMD
   */
  startIntegrationWithHackmd() {
    const hackmdUri = this.getHackmdUri();

    if (hackmdUri == null) {
      // do nothing
      return;
    }

    this.setState({isInitializing: true});

    const params = {
      pageId: this.props.pageId,
    };
    this.props.crowi.apiPost('/hackmd/integrate', params)
      .then(res => {
        if (!res.ok) {
          throw new Error(res.error);
        }

        this.setState({pageIdOnHackmd: res.pageIdOnHackmd});
      })
      .catch(this.apiErrorHandler)
      .then(() => {
        this.setState({isInitializing: false});
      });
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

    if (hackmdUri == null || this.state.pageIdOnHackmd == null) {
      return (
        <div className="hackmd-nopage d-flex justify-content-center align-items-center">
          <div>
            <p className="text-center">
              <button className="btn btn-success btn-lg waves-effect waves-light" type="button"
                  onClick={() => this.startIntegrationWithHackmd()} disabled={this.state.isInitializing}>
                <span className="btn-label"><i className="fa fa-file-text-o"></i></span>
                Start to edit with HackMD
              </button>
            </p>
            <p className="text-center">Clone this page and start to edit with multiple peoples.</p>
          </div>
        </div>
      );
    }

    return (
      <HackmdEditor
        markdown={this.props.markdown}
        hackmdUri={hackmdUri}
        pageIdOnHackmd={this.state.pageIdOnHackmd}
      >
      </HackmdEditor>
    );
  }
}

PageEditorByHackmd.propTypes = {
  crowi: PropTypes.object.isRequired,
  markdown: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  revisionIdHackmdSynced: PropTypes.string,
  pageIdOnHackmd: PropTypes.string,
};
