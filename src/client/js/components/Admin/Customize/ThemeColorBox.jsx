import React from 'react';
import PropTypes from 'prop-types';


class ThemeColorBox extends React.Component {

  render() {
    const { name } = this.props;

    return (
      <div
        id={`theme-option-${name}`}
        className={`theme-option-container d-flex flex-column align-items-center ${this.props.isSelected && 'active'}`}
        onClick={this.props.onSelected}
      >
        <a
          className={`m-0 ${name} theme-button`}
          id={name}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
            <g>
              <path d="M -1 -1 L65 -1 L65 65 L-1 65 L-1 -1 Z" fill={this.props.bg}></path>
              <path d="M -1 -1 L65 -1 L65 15 L-1 15 L-1 -1 Z" fill={this.props.topbar}></path>
              <path d="M 44 15 L65 15 L65 65 L44 65 L44 15 Z" fill={this.props.theme}></path>
            </g>
          </svg>
        </a>
        <span className="theme-option-name"><b>{ name }</b></span>
      </div>
    );
  }

}


ThemeColorBox.propTypes = {

  isSelected: PropTypes.bool.isRequired,
  onSelected: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  bg: PropTypes.string.isRequired,
  topbar: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
};

export default ThemeColorBox;
