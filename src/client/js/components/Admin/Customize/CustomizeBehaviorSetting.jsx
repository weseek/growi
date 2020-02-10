/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import CustomizeBehaviorOption from './CustomizeBehaviorOption';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';


class CustomizeBehaviorSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeBehavior();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.behavior') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2 className="admin-setting-header">{t('admin:customize_setting.behavior')}</h2>
        <div className="row">
          <div className="col-xs-6">
            <CustomizeBehaviorOption
              behaviorType="growi"
              isSelected={adminCustomizeContainer.state.currentBehavior === 'growi'}
              onSelected={() => adminCustomizeContainer.switchBehaviorType('growi')}
              labelHtml={`GROWI Simplified Behavior <small class="text-success">${t('admin:customize_setting.recommended')}</small>`}
            >
              <ul>
                <li><span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.behavior_desc.growi_text1') }} /></li>
                <li><span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.behavior_desc.growi_text2') }} /></li>
                <li><span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.behavior_desc.growi_text3') }} /></li>
              </ul>
            </CustomizeBehaviorOption>
          </div>

          <div className="col-xs-6">
            <CustomizeBehaviorOption
              behaviorType="crowi-plus"
              isSelected={adminCustomizeContainer.state.currentBehavior === 'crowi-plus'}
              onSelected={() => adminCustomizeContainer.switchBehaviorType('crowi-plus')}
              labelHtml="Crowi Classic Behavior"
            >
              <ul>
                <li><span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.behavior_desc.crowi_text1') }} /></li>
                <li><span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.behavior_desc.crowi_text2') }} /></li>
                <ul>
                  <li><span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.behavior_desc.crowi_text3') }} /></li>
                </ul>
                <li><span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.behavior_desc.crowi_text4') }} /></li>
                <li><span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.behavior_desc.crowi_text5') }} /></li>
              </ul>
            </CustomizeBehaviorOption>
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }

}

const CustomizeBehaviorSettingWrapper = (props) => {
  return createSubscribedElement(CustomizeBehaviorSetting, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeBehaviorSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeBehaviorSettingWrapper);
