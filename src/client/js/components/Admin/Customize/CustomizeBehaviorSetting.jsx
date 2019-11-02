import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

const logger = loggerFactory('growi:importer');

class CustomizeBehaviorSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    try {
      // await adminCustomizeContainer.updateCustomizeLayoutAndTheme();
      toastSuccess(t('customize_page.update_layout_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <h2>{t('customize_page.Behavior')}</h2>
        <div className="col-xs-6">
          <h4>
            <div className="radio radio-primary">
              <input type="radio" id="radioBehaviorGrowi" name="settingForm[customize:behavior]" value="growi" />
              <label htmlFor="radioBehaviorGrowi">
              GROWI Simplified Behavior <small className="text-success">(Recommended)</small>
              </label>
            </div>
          </h4>
          <ul>
            <li>Both of <code>/page</code> and <code>/page/</code> shows the same page</li>
            <li><code>/nonexistent_page</code> shows editing form</li>
            <li>All pages shows the list of sub pages <b>if using GROWI Enhanced Layout</b></li>
          </ul>
        </div>
        <div className="col-xs-6">
          <h4>
            <div className="radio radio-primary">
              <input type="radio" id="radioBehaviorCrowi" name="settingForm[customize:behavior]" value="crowi" />
              <label htmlFor="radioBehaviorCrowi">
              Crowi Classic Behavior
              </label>
            </div>
          </h4>
          <ul>
            <li><code>/page</code> shows the page</li>
            <li><code>/page/</code> shows the list of sub pages</li>
            <ul>
              <li>If portal is applied to <code>/page/</code> , the portal and the list of sub pages are shown</li>
            </ul>
            <li><code>/nonexistent_page</code> shows editing form</li>
            <li><code>/nonexistent_page/</code> the list of sub pages</li>
          </ul>
        </div>

        <div className="form-group my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <div className="btn btn-primary" onClick={this.onClickSubmit}>{ t('Update') }</div>
          </div>
        </div>
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
