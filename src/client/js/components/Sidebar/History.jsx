import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  HeaderSection,
  MenuSection,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

class History extends React.Component {

  static propTypes = {
    t: PropTypes.func.isRequired, // i18next
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  };

  state = {
  };

  PageItem = (page) => {
    return (
      <li className="list-group-item">
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">List group item heading</h5>
          <small>3 days ago</small>
        </div>
        <p className="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
        <small>Donec id elit non mi porta.</small>
      </li>
    );
  }

  render() {
    const { PageItem } = this;
    const { recentlyUpdatedPages } = this.props.appContainer.state;

    return (
      <>
        <HeaderSection>
          { () => (
            <div className="grw-sidebar-header-container p-3 d-flex">
              <h3>History</h3>
              <button type="button" className="btn xs btn-secondary ml-auto"><i className="icon icon-reload"></i></button>
            </div>
          ) }
        </HeaderSection>
        <MenuSection>
          { () => (
            <div className="grw-sidebar-content-container p-3">
              <ul className="list-group">
                { recentlyUpdatedPages.map(page => <PageItem page={page} />) }
              </ul>
            </div>
          ) }
        </MenuSection>
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const HistoryWrapper = (props) => {
  return createSubscribedElement(History, props, [AppContainer]);
};

export default withTranslation()(HistoryWrapper);
