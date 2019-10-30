import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

const logger = loggerFactory('growi:importer');

class CustomizeLayoutSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      toastSuccess(t('customize_page.update_layout_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

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
    const { t } = this.props;


    return (
      <form>
        {this.growiLayout()}
        {this.kibelaLayout()}
        {this.classicLayout()}
        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <div className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</div>
          </div>
        </div>
      </form>
    );
  }

}

const CustomizeLayoutSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeLayoutSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeLayoutSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeLayoutSettingWrapper);
