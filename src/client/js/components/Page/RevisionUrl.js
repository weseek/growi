import React from 'react';
import PropTypes from 'prop-types';

import CopyButton from '../CopyButton';

export default class RevisionUrl extends React.Component {

  constructor(props) {
    super(props);

    // retrieve xss library from window
    this.xss = window.xss;
  }

  render() {
    const buttonStyle = {
      fontSize: '1em'
    };

    const pagePath = this.xss.process(this.props.pagePath);

    const url = (this.props.pageId == null)
      ? decodeURIComponent(location.href)
      : `${location.origin}/${this.props.pageId}`;
    const copiedText = pagePath + '\n' + url;

    return (
      <span>
        {url}
        <CopyButton buttonId="btnCopyRevisionUrl" text={copiedText}
            buttonClassName="btn btn-default btn-copy-link" buttonStyle={buttonStyle} iconClassName="ti-clipboard" />
      </span>
    );
  }
}

RevisionUrl.propTypes = {
  pageId: PropTypes.string,
  pagePath: PropTypes.string.isRequired,
};
