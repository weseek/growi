import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../../services/AppContainer';
import AdminCustomizeContainer from '../../../../services/AdminCustomizeContainer';
import { createSubscribedElement } from '../../../UnstatedUtils';

class CustomizeKibelaLayout extends React.Component {

  render() {
    const { adminCustomizeContainer } = this.props;

    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input
              type="radio"
              id="radioLayoutKibela"
              checked={adminCustomizeContainer.state.currentLayout === 'kibela'}
              onChange={() => adminCustomizeContainer.switchLayoutType('kibela')}
            />
            <label htmlFor="radioLayoutKibela">
              Kibela Like Layout
            </label>
          </div>
        </h4>
        <a href="/images/admin/customize/layout-kibela.gif" className="ss-container">
          <img src="/images/admin/customize/layout-kibela-thumb.gif" width="240px" />
        </a>
        <h4>Easy Viewing Structure</h4>
        <ul>
          {/* TODO i18n */}
          <li>Center aligned contents</li>
          <li>Show and post comments at the bottom of the page</li>
          <li>Affix Table-of-contents</li>
        </ul>
      </div>
    );
  }

}

const CustomizeKibelaLayoutWrapper = (props) => {
  return createSubscribedElement(CustomizeKibelaLayout, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeKibelaLayout.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeKibelaLayoutWrapper);
