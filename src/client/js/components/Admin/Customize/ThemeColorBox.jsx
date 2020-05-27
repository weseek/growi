import React from 'react';
import PropTypes from 'prop-types';


class ThemeColorBox extends React.PureComponent {

  render() {
    const {
      isSelected, onSelected, name, bg, topbar, sidebar, theme,
    } = this.props;

    return (
      <div
        id={`theme-option-${name}`}
        className={`theme-option-container d-flex flex-column align-items-center ${isSelected && 'active'}`}
        onClick={onSelected}
      >
        <a id={name} type="button" className={`m-0 ${name} theme-button`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
            <g>
              <path d="M -1 -1 L65 -1 L65 65 L-1 65 L-1 -1 Z" fill={bg}></path>
              <path d="M -1 -1 L65 -1 L65 15 L-1 15 L-1 -1 Z" fill={topbar}></path>
              <path d="M -1 15 L15 15 L15 65 L-1 65 L-1 15 Z" fill={sidebar}></path>
              <path d="M 65 45 L65 65 L45 65 L65 45 Z" fill={theme}></path>
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
  sidebar: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
};

export default ThemeColorBox;
