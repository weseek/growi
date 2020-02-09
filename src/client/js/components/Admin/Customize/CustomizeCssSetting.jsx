import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomCssEditor from '../CustomCssEditor';

class CustomizeCssSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeCss();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.custom_css') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2 className="admin-setting-header">{t('admin:customize_setting.custom_css')}</h2>
        <p className="well">
          {t('admin:customize_setting.write_css')}<br />
          {t('admin:customize_setting.reflect_change')}
        </p>
        <div className="form-group">
          <div className="col-xs-12">
            <CustomCssEditor
              value={adminCustomizeContainer.state.currentCustomizeCss || ''}
              onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeCss(inputValue) }}
            />
          </div>
          <div className="col-xs-12">
            <p className="help-block text-right">
              <i className="fa fa-fw fa-keyboard-o" aria-hidden="true" />
              {t('admin:customize_setting.ctrl_space')}
            </p>
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }

}

const CustomizeCssSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeCssSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeCssSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeCssSettingWrapper);
