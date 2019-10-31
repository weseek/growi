import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';


class ThemeColorBox extends React.Component {

  isThemeSelected(name) {
    return (this.props.adminCustomizeContainer.state.themeType === name);
  }

  render() {
    const { name } = this.props;
    return (
      <div
        id={`theme-option-${name}`}
        className={`theme-option-container d-flex flex-column align-items-center ${this.isThemeSelected(name) && 'active'}`}
        onClick={() => this.props.adminCustomizeContainer.switchThemeType(name)}
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

const ThemeColorBoxWrapper = (props) => {
  return createSubscribedElement(ThemeColorBox, props, [AppContainer, AdminCustomizeContainer]);
};

ThemeColorBox.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,

  name: PropTypes.string.isRequired,
  bg: PropTypes.string.isRequired,
  topbar: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
};

export default withTranslation()(ThemeColorBoxWrapper);
