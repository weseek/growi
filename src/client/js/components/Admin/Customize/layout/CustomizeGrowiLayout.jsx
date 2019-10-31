import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../../services/AppContainer';
import AdminCustomizeContainer from '../../../../services/AdminCustomizeContainer';
import { createSubscribedElement } from '../../../UnstatedUtils';

class CustomizeGrowiLayout extends React.Component {

  render() {
    const { adminCustomizeContainer } = this.props;

    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input
              type="radio"
              id="radioLayoutGrowi"
              checked={adminCustomizeContainer.state.currentLayout === 'growi'}
              onChange={() => adminCustomizeContainer.switchLayoutType('growi')}
            />
            <label htmlFor="radioLayoutGrowi">
              GROWI Enhanced Layout <small className="text-success">(Recommended)</small>
            </label>
          </div>
        </h4>
        <a href="/images/admin/customize/layout-crowi-plus.gif" className="ss-container">
          <img src="/images/admin/customize/layout-crowi-plus-thumb.gif" width="240px" />
        </a>
        <h4>Simple and Clear</h4>
        <ul>
          {/* TODO i18n */}
          <li>Full screen layout and thin margins/paddings</li>
          <li>Show and post comments at the bottom of the page</li>
          <li>Affix Table-of-contents</li>
        </ul>
      </div>
    );
  }

}


const CustomizeGrowiLayoutWrapper = (props) => {
  return createSubscribedElement(CustomizeGrowiLayout, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeGrowiLayout.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeGrowiLayoutWrapper);
