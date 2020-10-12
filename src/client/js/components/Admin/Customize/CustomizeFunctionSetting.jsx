import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card, CardBody,
  // UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomizeFunctionOption from './CustomizeFunctionOption';

import PagingSizeUncontrolledDropdown from './PagingSizeUncontrolledDropdown';

class CustomizeFunctionSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
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

    // const dropdownGroupMapping = {
    //   S:  {
    //     label: 'admin:customize_setting.function_options.list_num_s',
    //     pageLimitation: adminCustomizeContainer.state.pageLimitationS,
    //     switchPageListLimitation: adminCustomizeContainer.switchPageListLimitationS,
    //     desc: 'admin:customize_setting.function_options.list_num_desc_s',
    //     dropdownMenu: [10, 20, 50, 100],
    //   },
    //   M:  {
    //     label: 'admin:customize_setting.function_options.list_num_m',
    //     pageLimitation: adminCustomizeContainer.state.pageLimitationM,
    //     switchPageListLimitation: adminCustomizeContainer.switchPageListLimitationM,
    //     desc: 'admin:customize_setting.function_options.list_num_desc_m',
    //     dropdownMenu: [5, 10, 20, 50, 100],
    //   },
    //   L: {
    //     label: 'admin:customize_setting.function_options.list_num_l',
    //     pageLimitation: adminCustomizeContainer.state.pageLimitationL,
    //     switchPageListLimitation: adminCustomizeContainer.switchPageListLimitationL,
    //     desc: 'admin:customize_setting.function_options.list_num_desc_l',
    //     dropdownMenu: [20, 50, 100, 200],
    //   },
    //   XL: {
    //     label: 'admin:customize_setting.function_options.list_num_xl',
    //     pageLimitation: adminCustomizeContainer.state.pageLimitationXL,
    //     switchPageListLimitation: adminCustomizeContainer.switchPageListLimitationXL,
    //     desc: 'admin:customize_setting.function_options.list_num_desc_xl',
    //     dropdownMenu: [5, 10, 20, 50, 100],
    //   },
    // };

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12">
            <h2 className="admin-setting-header">{t('admin:customize_setting.function')}</h2>
            <Card className="card well my-3">
              <CardBody className="px-0 py-2">
                {t('admin:customize_setting.function_desc')}
              </CardBody>
            </Card>


            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isSavedStatesOfTabChanges"
                  label={t('admin:customize_setting.function_options.tab_switch')}
                  isChecked={adminCustomizeContainer.state.isSavedStatesOfTabChanges}
                  onChecked={() => { adminCustomizeContainer.switchSavedStatesOfTabChanges() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.tab_switch_desc1')}<br />
                    {t('admin:customize_setting.function_options.tab_switch_desc2')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isEnabledAttachTitleHeader"
                  label={t('admin:customize_setting.function_options.attach_title_header')}
                  isChecked={adminCustomizeContainer.state.isEnabledAttachTitleHeader}
                  onChecked={() => { adminCustomizeContainer.switchEnabledAttachTitleHeader() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.attach_title_header_desc')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>

            <PagingSizeUncontrolledDropdown
              // toggleLabel={pageLimitation}
              dropdownItemSize={[10, 20, 50, 100]}
              // dropdownItemOnClickHandler={adminCustomizeContainer.switchPageListLimitationL.bind(adminCustomizeContainer)}
            />
            <PagingSizeUncontrolledDropdown
              // toggleLabel={pageLimitation}
              dropdownItemSize={[5, 10, 20, 50, 100]}
              // dropdownItemOnClickHandler={adminCustomizeContainer.switchPageListLimitationL.bind(adminCustomizeContainer)}
            />

            {/* {Object.entries(dropdownGroupMapping).map(([key, value]) => {
              return (
                <div className="form-group row" key={key}>
                  <div className="offset-md-3 col-md-6 text-left">
                    <div className="my-0 w-100">
                      <label>{t(value.label)}</label>
                    </div>
                    <UncontrolledDropdown>
                      <DropdownToggle className="text-right col-6" caret>
                        <span className="float-left">{value.pageLimitation}</span>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu" role="menu">
                        {value.dropdownMenu.map((num) => {
                          return (
                            <DropdownItem key={num} role="presentation" onClick={() => { value.switchPageListLimitation(num) }}>
                              <a role="menuitem">{num}</a>
                            </DropdownItem>
                          );
                        })}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                    <p className="form-text text-muted">
                      {t(value.desc)}
                    </p>
                  </div>
                </div>
              );
            })} */}

            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isEnabledStaleNotification"
                  label={t('admin:customize_setting.function_options.stale_notification')}
                  isChecked={adminCustomizeContainer.state.isEnabledStaleNotification}
                  onChecked={() => { adminCustomizeContainer.switchEnableStaleNotification() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.stale_notification_desc')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>

            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isAllReplyShown"
                  label={t('admin:customize_setting.function_options.show_all_reply_comments')}
                  isChecked={adminCustomizeContainer.state.isAllReplyShown || false}
                  onChecked={() => { adminCustomizeContainer.switchIsAllReplyShown() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.show_all_reply_comments_desc')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>

            <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
          </div>
        </div>
      </React.Fragment>
    );
  }

}

const CustomizeFunctionSettingWrapper = withUnstatedContainers(CustomizeFunctionSetting, [AppContainer, AdminCustomizeContainer]);

CustomizeFunctionSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeFunctionSettingWrapper);
