import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import NavigationContainer from '../../services/NavigationContainer';


class SidebarNav extends React.Component {

  static propTypes = {
    onItemSelected: PropTypes.func,
  };

  state = {
  };

  itemSelectedHandler = (contentsId) => {
    const { navigationContainer, onItemSelected } = this.props;
    if (onItemSelected != null) {
      onItemSelected(contentsId);
    }

    navigationContainer.setState({ sidebarContentsId: contentsId });
  }

  PrimaryItem = ({ id, label, iconName }) => {
    const { sidebarContentsId } = this.props.navigationContainer.state;
    const isSelected = sidebarContentsId === id;

    return (
      <button
        type="button"
        className={`d-block btn btn-primary ${isSelected ? 'active' : ''}`}
        onClick={() => this.itemSelectedHandler(id)}
      >
        <i className="material-icons">{iconName}</i>
      </button>
    );
  }

  SecondaryItem({
    label, iconName, href, isBlank,
  }) {
    return (
      <a href={href} className="d-block btn btn-primary" target={`${isBlank ? '_blank' : ''}`}>
        <i className="material-icons">{iconName}</i>
      </a>
    );
  }

  generateIconFactory(classNames) {
    return () => <i className={classNames}></i>;
  }

  render() {
    const { isAdmin, currentUsername, isSharedUser } = this.props.appContainer;
    const isLoggedIn = currentUsername != null;

    const { PrimaryItem, SecondaryItem } = this;

    return (
      <div className="grw-sidebar-nav">
        <div className="grw-sidebar-nav-primary-container">
          {!isSharedUser && <PrimaryItem id="custom" label="Custom Sidebar" iconName="code" />}
          {!isSharedUser && <PrimaryItem id="recent" label="Recent Changes" iconName="update" />}
          {/* <PrimaryItem id="tag" label="Tags" iconName="icon-tag" /> */}
          {/* <PrimaryItem id="favorite" label="Favorite" iconName="icon-star" /> */}
        </div>
        <div className="grw-sidebar-nav-secondary-container">
          {isAdmin && <SecondaryItem label="Admin" iconName="settings" href="/admin" />}
          {isLoggedIn && <SecondaryItem label="Draft" iconName="file_copy" href="/me/drafts" />}
          <SecondaryItem label="Help" iconName="help" href="https://docs.growi.org" isBlank />
          {isLoggedIn && <SecondaryItem label="Trash" iconName="delete" href="/trash" />}
        </div>
      </div>
    );
  }

}

SidebarNav.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SidebarNavWrapper = withUnstatedContainers(SidebarNav, [AppContainer, NavigationContainer]);

export default withTranslation()(SidebarNavWrapper);
