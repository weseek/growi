import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomizeFunctionOption from './CustomizeFunctionOption';

class CustomizeBehaviorSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeFunction();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.function') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <h2 className="admin-setting-header">{t('admin:customize_setting.function')}</h2>
        <p className="well">{t('admin:customize_setting.function_desc')}</p>

        <div className="form-group row">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <CustomizeFunctionOption
              optionId="isEnabledTimeline"
              label={t('admin:customize_setting.function_options.timeline')}
              isChecked={adminCustomizeContainer.state.isEnabledTimeline}
              onChecked={() => { adminCustomizeContainer.switchEnableTimeline() }}
            >
              <p className="help-block">
                {t('admin:customize_setting.function_options.timeline_desc1')}<br />
                {t('admin:customize_setting.function_options.timeline_desc2')}<br />
                {t('admin:customize_setting.function_options.timeline_desc3')}
              </p>
            </CustomizeFunctionOption>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <CustomizeFunctionOption
              optionId="isSavedStatesOfTabChanges"
              label={t('admin:customize_setting.function_options.tab_switch')}
              isChecked={adminCustomizeContainer.state.isSavedStatesOfTabChanges}
              onChecked={() => { adminCustomizeContainer.switchSavedStatesOfTabChanges() }}
            >
              <p className="help-block">
                {t('admin:customize_setting.function_options.tab_switch_desc1')}<br />
                {t('admin:customize_setting.function_options.tab_switch_desc2')}
              </p>
            </CustomizeFunctionOption>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <CustomizeFunctionOption
              optionId="isEnabledAttachTitleHeader"
              label={t('admin:customize_setting.function_options.attach_title_header')}
              isChecked={adminCustomizeContainer.state.isEnabledAttachTitleHeader}
              onChecked={() => { adminCustomizeContainer.switchEnabledAttachTitleHeader() }}
            >
              <p className="help-block">
                {t('admin:customize_setting.function_options.attach_title_header_desc')}
              </p>
            </CustomizeFunctionOption>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <div className="my-0 btn-group">
              <label>{t('admin:customize_setting.function_options.recent_created__n_draft_num_desc')}</label>
              <div className="dropdown">
                <button className="btn btn-default dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="pull-left">{adminCustomizeContainer.state.currentRecentCreatedLimit}</span>
                  <span className="bs-caret pull-right">
                    <span className="caret" />
                  </span>
                </button>
                {/* TODO adjust dropdown after BS4 */}
                <ul className="dropdown-menu" role="menu">
                  <li key={10} role="presentation" type="button" onClick={() => { adminCustomizeContainer.switchRecentCreatedLimit(10) }}>
                    <a role="menuitem">10</a>
                  </li>
                  <li key={30} role="presentation" type="button" onClick={() => { adminCustomizeContainer.switchRecentCreatedLimit(30) }}>
                    <a role="menuitem">30</a>
                  </li>
                  <li key={50} role="presentation" type="button" onClick={() => { adminCustomizeContainer.switchRecentCreatedLimit(50) }}>
                    <a role="menuitem">50</a>
                  </li>
                </ul>
              </div>
              <p className="help-block">
                {t('admin:customize_setting.function_options.recently_created_n_draft_num_desc')}
              </p>
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <CustomizeFunctionOption
              optionId="isEnabledStaleNotification"
              label={t('admin:customize_setting.function_options.stale_notification')}
              isChecked={adminCustomizeContainer.state.isEnabledStaleNotification}
              onChecked={() => { adminCustomizeContainer.switchEnableStaleNotification() }}
            >
              <p className="help-block">
                {t('admin:customize_setting.function_options.stale_notification_desc')}
              </p>
            </CustomizeFunctionOption>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <CustomizeFunctionOption
              optionId="isAllReplyShown"
              label={t('admin:customize_setting.function_options.show_all_reply_comments')}
              isChecked={adminCustomizeContainer.state.isAllReplyShown || false}
              onChecked={() => { adminCustomizeContainer.switchIsAllReplyShown() }}
            >
              <p className="help-block">
                {t('admin:customize_setting.function_options.show_all_reply_comments_desc')}
              </p>
            </CustomizeFunctionOption>
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
