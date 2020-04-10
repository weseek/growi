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

  generateSidebarItemObj(id, label, icon) {
    return {
      id,
      icon,
      label,
      isSelected: this.props.currentContentsId === id,
      onClick: () => this.itemSelectedHandler(id),
    };
  }

  generateIconFactory(classNames) {
    return () => <i className={classNames}></i>;
  }

  render() {
    return (
      <GlobalNav
        primaryItems={[
          this.generateSidebarItemObj('custom', 'Custom Sidebar', this.generateIconFactory('fa fa-2x fa-code')),
          this.generateSidebarItemObj('history', 'History', this.generateIconFactory('icon-clock fa-2x')),
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
