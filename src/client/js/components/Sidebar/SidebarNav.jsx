import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import EditIcon from '@atlaskit/icon/glyph/edit';
import TrayIcon from '@atlaskit/icon/glyph/tray';

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

  generateSidebarItemObj(id, icon, label) {
    return {
      id,
      icon,
      label,
      isSelected: this.props.currentContentsId === id,
      onClick: () => this.itemSelectedHandler(id),
    };
  }

  render() {
    return (
      <GlobalNav
        primaryItems={[
          this.generateSidebarItemObj('custom', EditIcon, 'Custom Sidebar'),
          this.generateSidebarItemObj('history', TrayIcon, 'History'),
        ]}
        secondaryItems={[]}
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
