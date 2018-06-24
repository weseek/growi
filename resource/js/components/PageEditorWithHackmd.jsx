import React from 'react';
import PropTypes from 'prop-types';

import HackmdEditor from './PageEditorWithHackmd/HackmdEditor';

export default class PageEditorWithHackmd extends React.PureComponent {

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
      return <React.Fragment></React.Fragment>;
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

PageEditorWithHackmd.propTypes = {
  crowi: PropTypes.object.isRequired,
  markdown: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  revisionIdHackmdSynced: PropTypes.string,
  pageIdOnHackmd: PropTypes.string,
};
