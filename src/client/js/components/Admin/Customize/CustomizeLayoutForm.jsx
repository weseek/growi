import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';


class CustomizeLayoutForm extends React.Component {

  growiLayout() {
    const { adminCustomizeContainer } = this.props;

    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input
              type="radio"
              id="radioLayoutGrowi"
              checked={adminCustomizeContainer.state.layoutType === 'growi'}
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

  kibelaLayout() {
    const { adminCustomizeContainer } = this.props;

    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input
              type="radio"
              id="radioLayoutKibela"
              checked={adminCustomizeContainer.state.layoutType === 'kibela'}
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

  classicLayout() {
    const { adminCustomizeContainer } = this.props;

    return (
      <div className="col-sm-4">
        <h4>
          <div className="radio radio-primary">
            <input
              type="radio"
              id="radioLayoutCrowi"
              checked={adminCustomizeContainer.state.layoutType === 'crowi'}
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

  render() {
    return (
      <form>
        {this.growiLayout()}
        {this.kibelaLayout()}
        {this.classicLayout()}
      </form>
    );
  }

}

const CustomizeLayoutFormWrapper = (props) => {
  return createSubscribedElement(CustomizeLayoutForm, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeLayoutForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeLayoutFormWrapper);
