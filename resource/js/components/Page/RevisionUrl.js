import React from 'react';
import CopyButton from '../CopyButton';

export default class RevisionUrl extends React.Component {

  showToolTip() {
    $('#btnCopy').tooltip('show');
    setTimeout(() => {
      $('#btnCopy').tooltip('hide');
    }, 1000);
  }

  render() {
    const buttonStyle = {
      fontSize: "1em"
    }

    const url = (this.props.pageId === '')
        ? decodeURIComponent(location.href)
        : `${location.origin}/${this.props.pageId}`;
    const copiedText = this.props.pagePath + '\n' + url;

    return (
      <span>
        {url}
        <CopyButton buttonId="btnCopyRevisionUrl" text={copiedText}
            buttonClassName="btn btn-default btn-muted" buttonStyle={buttonStyle} iconClassName="fa fa-link text-muted" />
      </span>
    );
  }
}

RevisionUrl.propTypes = {
  pageId: React.PropTypes.string.isRequired,
  pagePath: React.PropTypes.string.isRequired,
};
