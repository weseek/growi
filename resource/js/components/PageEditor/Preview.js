import React from 'react';
import PropTypes from 'prop-types';

export default class Preview extends React.Component {

  constructor(props) {
    super(props);
  }

  generateInnerHtml(html) {
    return {__html: html};
  }

  render() {
    return (
      <div
        ref={this.props.inputRef}
        className="wiki preview-body" dangerouslySetInnerHTML={this.generateInnerHtml(this.props.html)}>
      </div>
    )
  }
}

Preview.propTypes = {
  html: PropTypes.string,
  inputRef: PropTypes.func.isRequired,  // for getting div element
};
