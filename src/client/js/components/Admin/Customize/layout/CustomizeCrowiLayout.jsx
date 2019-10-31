import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../../services/AppContainer';
import AdminCustomizeContainer from '../../../../services/AdminCustomizeContainer';
import { createSubscribedElement } from '../../../UnstatedUtils';

class CustomizeCrowiLayout extends React.Component {

  render() {
    const { adminCustomizeContainer } = this.props;

    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input
              type="radio"
              id="radioLayoutCrowi"
              checked={adminCustomizeContainer.state.currentLayout === 'crowi'}
              onChange={() => adminCustomizeContainer.switchLayoutType('crowi')}
            />
            <label htmlFor="radioLayoutCrowi">
                Crowi Classic Layout
            </label>
          </div>
        </h4>
        <a href="/images/admin/customize/layout-classic.gif" className="ss-container">
          <img src="/images/admin/customize/layout-classic-thumb.gif" width="240px" />
        </a>
        <h4>Separated Functions</h4>
        <ul>
          {/* TODO i18n */}
          <li>Collapsible Sidebar</li>
          <li>Show and post comments in Sidebar</li>
          <li>Collapsible Table-of-contents</li>
        </ul>
      </div>
    );
  }

}

const CustomizeCrowiLayoutWrapper = (props) => {
  return createSubscribedElement(CustomizeCrowiLayout, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeCrowiLayout.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeCrowiLayoutWrapper);
