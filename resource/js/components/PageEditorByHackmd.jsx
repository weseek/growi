import React from 'react';
import PropTypes from 'prop-types';

import HackmdEditor from './PageEditorByHackmd/HackmdEditor';

export default class PageEditorByHackmd extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentWillMount() {
  }

  syncToLatestRevision() {

  }

  render() {
    const envVars = this.props.crowi.config.env;
    const hackMdUri = envVars.HACKMD_URI;

    if (hackMdUri == null || this.props.pageIdOnHackmd == null) {
      return (
        <div className="hackmd-nopage d-flex justify-content-center align-items-center">
          <div>
            <p className="text-center">
              <button className="btn btn-success btn-lg waves-effect waves-light" type="button">
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
        hackMdUri={hackMdUri}
        pageIdOnHackmd={this.props.pageIdOnHackmd}
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
