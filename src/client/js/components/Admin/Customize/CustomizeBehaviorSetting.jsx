/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import CustomizeBehaviorOption from './CustomizeBehaviorOption';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:Customize');

class CustomizeBehaviorSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeBehavior();
      toastSuccess(t('customize_page.update_behavior_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2>{t('customize_page.Behavior')}</h2>
        <div className="row">
          <div className="col-xs-6">
            <CustomizeBehaviorOption
              behaviorType="growi"
              isSelected={adminCustomizeContainer.state.currentBehavior === 'growi'}
              onSelected={() => adminCustomizeContainer.switchBehaviorType('growi')}
              labelHtml={`GROWI Simplified Behavior <small class="text-success">${t('customize_page.recommended')}</small>`}
            >
              <ul>
                <li><span dangerouslySetInnerHTML={{ __html: t('customize_page.behavior_description.growi_text1') }} /></li>
                <li><span dangerouslySetInnerHTML={{ __html: t('customize_page.behavior_description.growi_text2') }} /></li>
                <li><span dangerouslySetInnerHTML={{ __html: t('customize_page.behavior_description.growi_text3') }} /></li>
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
                <li><span dangerouslySetInnerHTML={{ __html: t('customize_page.behavior_description.crowi_text1') }} /></li>
                <li><span dangerouslySetInnerHTML={{ __html: t('customize_page.behavior_description.crowi_text2') }} /></li>
                <ul>
                  <li><span dangerouslySetInnerHTML={{ __html: t('customize_page.behavior_description.crowi_text3') }} /></li>
                </ul>
                <li><span dangerouslySetInnerHTML={{ __html: t('customize_page.behavior_description.crowi_text4') }} /></li>
                <li><span dangerouslySetInnerHTML={{ __html: t('customize_page.behavior_description.crowi_text5') }} /></li>
              </ul>
            </CustomizeBehaviorOption>
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.onClickSubmit} />
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
