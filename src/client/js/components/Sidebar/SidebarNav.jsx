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

  generatePrimaryItemObj(id, label, iconName) {
    const isSelected = this.props.currentContentsId === id;

    return {
      id,
      component: ({ className }) => (
        <div className={`${className} grw-global-item-container ${isSelected ? 'active' : ''}`}>
          <button
            type="button"
            className={`btn btn-primary btn-lg ${isSelected ? 'active' : ''}`}
            onClick={() => this.itemSelectedHandler(id)}
          >
            <i className="material-icons">{iconName}</i>
          </button>
        </div>
      ),
    };
  }

  generateSecondaryItemObj(id, label, iconName, href, isBlank) {
    return {
      id,
      component: ({ className }) => (
        <div className={`${className} grw-global-item-container`}>
          <a href={href} className="btn btn-primary" target={`${isBlank ? '_blank' : ''}`}>
            <i className="material-icons">{iconName}</i>
          </a>
        </div>
      ),
    };
  }

  generateIconFactory(classNames) {
    return () => <i className={classNames}></i>;
  }

  render() {
    const { isAdmin, currentUsername } = this.props.appContainer;

    const primaryItems = [
      this.generatePrimaryItemObj('custom', 'Custom Sidebar', 'code'),
      this.generatePrimaryItemObj('recent', 'Recent Changes', 'update'),
      // this.generatePrimaryItemObj('tag', 'Tags', 'icon-tag'),
      // this.generatePrimaryItemObj('favorite', 'Favorite', 'icon-star'),
    ];

    const secondaryItems = [
      this.generateSecondaryItemObj('help', 'Help', 'help', 'https://docs.growi.org', true),
    ];

    if (currentUsername != null) {
      secondaryItems.unshift( // add to the beginning
        this.generateSecondaryItemObj('draft', 'Draft', 'file_copy', `/user/${currentUsername}#user-draft-list`),
        this.generateSecondaryItemObj('trash', 'Trash', 'delete', '/trash'),
      );
    }
    if (isAdmin) {
      secondaryItems.unshift( // add to the beginning
        this.generateSecondaryItemObj('admin', 'Admin', 'settings', '/admin'),
      );
    }

    return (
      <GlobalNav
        primaryItems={primaryItems}
        secondaryItems={secondaryItems}
      />
    );
  }

}

SidebarNav.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SidebarNavWrapper = (props) => {
  return createSubscribedElement(SidebarNav, props, [AppContainer]);
};

export default withTranslation()(SidebarNavWrapper);
