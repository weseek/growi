import React from 'react';
import PropTypes from 'prop-types';
import ClipboardButton from 'react-clipboard.js';

export default class CopyButton extends React.Component {

  constructor(props) {
    super(props);

    this.showToolTip = this.showToolTip.bind(this);

    // retrieve xss library from window
    this.xss = window.xss;
  }

  showToolTip() {
    const buttonId = `#${this.props.buttonId}`;
    $(buttonId).tooltip('show');
    setTimeout(() => {
      $(buttonId).tooltip('hide');
    }, 1000);
  }

  render() {
    const containerStyle = {
      lineHeight: 0
    };
    const style = Object.assign({
      padding: '0 2px',
      verticalAlign: 'text-top',
    }, this.props.buttonStyle);

    const text = this.xss.process(this.props.text);

    return (
      <span className="btn-copy-container" style={containerStyle}>
        <ClipboardButton className={this.props.buttonClassName}
            button-id={this.props.buttonId} button-data-toggle="tooltip" button-data-container="body" button-title="copied!" button-data-placement="bottom" button-data-trigger="manual"
            button-style={style}
            data-clipboard-text={text} onSuccess={this.showToolTip}>

          <i className={this.props.iconClassName}></i>
        </ClipboardButton>
      </span>
    );
  }
}

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  buttonId: PropTypes.string.isRequired,
  buttonClassName: PropTypes.string.isRequired,
  buttonStyle: PropTypes.object,
  iconClassName: PropTypes.string.isRequired,
};
CopyButton.defaultProps = {
  buttonId: 'btnCopy',
  buttonStyle: {},
};
