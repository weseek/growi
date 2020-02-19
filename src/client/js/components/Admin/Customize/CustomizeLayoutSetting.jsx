import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import CustomizeLayoutOptions from './CustomizeLayoutOptions';
import CustomizeThemeOptions from './CustomizeThemeOptions';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

class CustomizeLayoutSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeLayoutAndTheme();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.layout') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  renderDevAlert() {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="alert alert-warning">
          <strong>DEBUG MESSAGE:</strong> development build では、リアルタイムプレビューが無効になります
        </div>
      );
    }
  }


  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2 className="admin-setting-header">{t('admin:customize_setting.layout')}</h2>
        <CustomizeLayoutOptions />
        <h2 className="admin-setting-header">{t('admin:customize_setting.theme')}</h2>
        {this.renderDevAlert()}
        <CustomizeThemeOptions />
        <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
      </React.Fragment>
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
