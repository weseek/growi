import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  GlobalNav,
  GlobalItem,
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

  generatePrimaryItemObj(id, label, icon) {
    const isSelected = this.props.currentContentsId === id;

    return {
      id,
      component: ({ className }) => (
        <div className={`${className} grw-global-item-container ${isSelected ? 'active' : ''}`}>
          <GlobalItem
            icon={icon}
            label={label}
            isSelected={isSelected}
            onClick={() => this.itemSelectedHandler(id)}
          />
        </div>
      ),
    };
  }

  generateSecondaryItemObj(id, label, icon, href) {
    return {
      id,
      component: ({ className }) => (
        <div className={`${className} grw-global-item-container d-block d-md-none`}>
          <a href={href}>
            <GlobalItem
              icon={icon}
              label={label}
            />
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
          this.generatePrimaryItemObj('custom', 'Custom Sidebar', this.generateIconFactory('fa fa-code')),
          this.generatePrimaryItemObj('history', 'History', this.generateIconFactory('icon-clock')),
        ]}
        secondaryItems={[
          this.generateSecondaryItemObj('admin', 'Admin', this.generateIconFactory('icon-settings'), '/admin'),
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
