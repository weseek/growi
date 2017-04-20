import React from 'react';
import ClipboardButton from 'react-clipboard.js';

export default class CopyButton extends React.Component {

  showToolTip() {
    $('#btnCopy').tooltip('show');
    setTimeout(() => {
      $('#btnCopy').tooltip('hide');
    }, 1000);
  }

  render() {
    return (
      <ClipboardButton className={this.props.buttonClassName}
          button-id="btnCopy" button-data-toggle="tooltip" button-title="copied!" button-data-placement="bottom" button-data-trigger="manual"
          data-clipboard-text={this.props.text} onSuccess={this.showToolTip}>

        <i className={this.props.iconClassName}></i>
      </ClipboardButton>
    );
  }
}

CopyButton.propTypes = {
  text: React.PropTypes.string.isRequired,
  buttonClassName: React.PropTypes.string.isRequired,
  iconClassName: React.PropTypes.string.isRequired,
};
