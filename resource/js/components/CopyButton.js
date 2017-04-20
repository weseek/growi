import React from 'react';
import ClipboardButton from 'react-clipboard.js';

export default class CopyButton extends React.Component {

  constructor(props) {
    super(props);

    this.showToolTip = this.showToolTip.bind(this);
  }

  showToolTip() {
    const buttonId = `#${this.props.buttonId}`;
    $(buttonId).tooltip('show');
    setTimeout(() => {
      $(buttonId).tooltip('hide');
    }, 1000);
  }

  render() {
    let style = Object.assign({
      fontSize: "inherit",
      padding: "2px",
      border: 'none'
    }, this.props.buttonStyle);

    return (
      <ClipboardButton className={this.props.buttonClassName}
          button-id={this.props.buttonId} button-data-toggle="tooltip" button-title="copied!" button-data-placement="bottom" button-data-trigger="manual"
          button-style={style}
          data-clipboard-text={this.props.text} onSuccess={this.showToolTip}>

        <i className={this.props.iconClassName}></i>
      </ClipboardButton>
    );
  }
}

CopyButton.propTypes = {
  text: React.PropTypes.string.isRequired,
  buttonId: React.PropTypes.string.isRequired,
  buttonClassName: React.PropTypes.string.isRequired,
  buttonStyle: React.PropTypes.object,
  iconClassName: React.PropTypes.string.isRequired,
};
CopyButton.defaultProps = {
  buttonId: 'btnCopy',
  buttonStyle: {},
};
