import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card, CardBody,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomizeFunctionOption from './CustomizeFunctionOption';

const logger = loggerFactory('growi:importer');

class CustomizeBehaviorSetting extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeFunction();
      toastSuccess(t('customize_page.update_function_success'));
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
        <h2 className="admin-setting-header">{t('customize_page.Function')}</h2>
        <Card className="card-well my-3">
          <CardBody>
            { t('customize_page.function_choose') }
          </CardBody>
        </Card>


        <div className="form-group row">
          <div className="offset-3 col-6 text-left">
            <CustomizeFunctionOption
              optionId="isEnabledTimeline"
              label={t('customize_page.Timeline function')}
              isChecked={adminCustomizeContainer.state.isEnabledTimeline}
              onChecked={() => { adminCustomizeContainer.switchEnableTimeline() }}
            >
              <p className="help-block">
                { t('customize_page.subpage_display') }<br />
                { t('customize_page.performance_decrease') }<br />
                { t('customize_page.list_page_display') }
              </p>
            </CustomizeFunctionOption>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-3 col-6 text-left">
            <CustomizeFunctionOption
              optionId="isSavedStatesOfTabChanges"
              label={t('customize_page.tab_switch')}
              isChecked={adminCustomizeContainer.state.isSavedStatesOfTabChanges}
              onChecked={() => { adminCustomizeContainer.switchSavedStatesOfTabChanges() }}
            >
              <p className="help-block">
                { t('customize_page.save_edit') }<br />
                { t('customize_page.by_invalidating') }
              </p>
            </CustomizeFunctionOption>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-3 col-6 text-left">
            <CustomizeFunctionOption
              optionId="isEnabledAttachTitleHeader"
              label={t('customize_page.attach_title_header')}
              isChecked={adminCustomizeContainer.state.isEnabledAttachTitleHeader}
              onChecked={() => { adminCustomizeContainer.switchEnabledAttachTitleHeader() }}
            >
              <p className="help-block">
                { t('customize_page.attach_title_header_desc') }
              </p>
            </CustomizeFunctionOption>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-3 col-6 text-left">
            <div className="my-0 btn-group">
              <label>{t('customize_page.recent_created__n_draft_num_desc')}</label>

              <UncontrolledDropdown data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <DropdownToggle caret>
                  <span className="pull-left">{adminCustomizeContainer.state.currentRecentCreatedLimit}</span>
                  <span className="bs-caret pull-right">
                    <span className="caret" />
                  </span>
                </DropdownToggle>
              </UncontrolledDropdown>
              {/* TODO adjust dropdown after BS4 */}
              <DropdownMenu className="dropdown-menu" role="menu">
                <DropdownItem key={10} role="presentation" type="button" onClick={() => { adminCustomizeContainer.switchRecentCreatedLimit(10) }}>
                  <a role="menuitem">10</a>
                </DropdownItem>
                <DropdownItem key={30} role="presentation" type="button" onClick={() => { adminCustomizeContainer.switchRecentCreatedLimit(30) }}>
                  <a role="menuitem">30</a>
                </DropdownItem>
                <DropdownItem key={50} role="presentation" type="button" onClick={() => { adminCustomizeContainer.switchRecentCreatedLimit(50) }}>
                  <a role="menuitem">50</a>
                </DropdownItem>
              </DropdownMenu>

              <p className="help-block">
                { t('customize_page.recently_created_n_draft_num_desc') }
              </p>
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-3 col-6 text-left">
            <CustomizeFunctionOption
              optionId="isEnabledStaleNotification"
              label={t('customize_page.stale_notification')}
              isChecked={adminCustomizeContainer.state.isEnabledStaleNotification}
              onChecked={() => { adminCustomizeContainer.switchEnableStaleNotification() }}
            >
              <p className="help-block">
                { t('customize_page.stale_notification_desc') }
              </p>
            </CustomizeFunctionOption>
          </div>
        </div>

        <div className="form-group col-12 m-3">
          <div className="offset-4 col-8">
            <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
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
