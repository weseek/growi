import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  GlobalNav,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';


class SidebarNav extends React.Component {

  static propTypes = {
    currentContentsId: PropTypes.string,
    onItemSelected: PropTypes.func,
  };

  state = {
  };

  itemSelectedHandler = (contentsId) => {
    const { onItemSelected } = this.props;
    if (onItemSelected != null) {
      onItemSelected(contentsId);
    }
  }

  generatePrimaryItemObj(id, label, iconClassNames) {
    const isSelected = this.props.currentContentsId === id;

    return {
      id,
      component: ({ className }) => (
        <div className={`${className} grw-global-item-container ${isSelected ? 'active' : ''}`}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => this.itemSelectedHandler(id)}
          >
            <i className={iconClassNames}></i>
          </button>
        </div>
      ),
    };
  }

  generateSecondaryItemObj(id, label, iconClassNames, href) {
    return {
      id,
      component: ({ className }) => (
        <div className={`${className} grw-global-item-container d-block d-md-none`}>
          <a href={href} className="btn btn-primary btn-lg">
            <i className={iconClassNames}></i>
          </a>
        </div>
      ),
    };
  }

  generateIconFactory(classNames) {
    return () => <i className={classNames}></i>;
  }

  render() {
    return (
      <GlobalNav
        primaryItems={[
          this.generatePrimaryItemObj('custom', 'Custom Sidebar', 'fa fa-code'),
          this.generatePrimaryItemObj('recent', 'Recent Changes', 'icon-clock'),
        ]}
        secondaryItems={[
          this.generateSecondaryItemObj('admin', 'Admin', 'icon-settings', '/admin'),
          this.generateSecondaryItemObj('help', 'Help', 'icon-question', 'https://docs.growi.org'),
        ]}
      />
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SidebarNavWrapper = (props) => {
  return createSubscribedElement(SidebarNav, props, [AppContainer]);
};

export default withTranslation()(SidebarNavWrapper);
