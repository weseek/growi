import React from 'react';
// import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  HeaderSection,
  MenuSection,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

class History extends React.Component {

  static propTypes = {
  };

  state = {
  };

  renderHeaderWordmark() {
    return <h3>History</h3>;
  }

  render() {
    return (
      <>
        <HeaderSection>
          { () => (
            <div className="grw-sidebar-header-container">
              {this.renderHeaderWordmark()}
            </div>
          ) }
        </HeaderSection>
        <MenuSection>
          { () => (
            <div className="grw-sidebar-content-container">
              <span>(TBD) History Contents</span>
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
