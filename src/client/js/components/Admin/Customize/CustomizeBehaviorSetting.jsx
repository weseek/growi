import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import CustomizeBehaviorOption from './CustomizeBehaviorOption';
import AdminUpdateButton from '../Common/AdminUpdateButton';

const logger = loggerFactory('growi:importer');

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
        <CustomizeBehaviorOption
          behaviorType="growi"
          isSelected={adminCustomizeContainer.state.currentBehavior === 'growi'}
          onSelected={() => adminCustomizeContainer.switchBehaviorType('growi')}
          labelHtml='GROWI Simplified Behavior <small className="text-success">(Recommended)</small>'
        >
          {/* TODO i18n */}
          <ul>
            <li>Both of <code>/page</code> and <code>/page/</code> shows the same page</li>
            <li><code>/nonexistent_page</code> shows editing form</li>
            <li>All pages shows the list of sub pages <b>if using GROWI Enhanced Layout</b></li>
          </ul>
        </CustomizeBehaviorOption>

        <CustomizeBehaviorOption
          behaviorType="crowi-plus"
          isSelected={adminCustomizeContainer.state.currentBehavior === 'crowi-plus'}
          onSelected={() => adminCustomizeContainer.switchBehaviorType('crowi-plus')}
          labelHtml="Crowi Classic Behavior"
        >
          {/* TODO i18n */}
          <ul>
            <li><code>/page</code> shows the page</li>
            <li><code>/page/</code> shows the list of sub pages</li>
            <ul>
              <li>If portal is applied to <code>/page/</code> , the portal and the list of sub pages are shown</li>
            </ul>
            <li><code>/nonexistent_page</code> shows editing form</li>
            <li><code>/nonexistent_page/</code> the list of sub pages</li>
          </ul>
        </CustomizeBehaviorOption>

        <AdminUpdateButton onClick={this.onClickSubmit} />
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
