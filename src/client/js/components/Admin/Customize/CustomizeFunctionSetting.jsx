import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card, CardBody,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomizeFunctionOption from './CustomizeFunctionOption';

// const { adminCustomizeContainer } = this.props;
// const dropdownGroupMapping = {
//   S:  {
//     isDropdownOpen: this.state.isDropdownOpenS,
//     toggle: this.onToggleDropdownS,
//     pageLimitation: adminCustomizeContainer.state.pageLimitationS,
//     switchPageListLimitationS: adminCustomizeContainer.switchPageListLimitationS(),
//   },
//   M:  {
//     isDropdownOpen: this.state.isDropdownOpenM,
//     toggle: this.onToggleDropdownM,
//     pageLimitation: adminCustomizeContainer.state.pageLimitationM,
//     switchPageListLimitationS: adminCustomizeContainer.switchPageListLimitationM(),
//   },
//   L: {
//     isDropdownOpen: this.state.isDropdownOpenL,
//     toggle: this.onToggleDropdownL,
//     pageLimitation: adminCustomizeContainer.state.pageLimitationL,
//     switchPageListLimitationS: adminCustomizeContainer.switchPageListLimitationL(),
//   },
//   XL: {
//     isDropdownOpen: this.state.isDropdownOpenXL,
//     toggle: this.onToggleDropdownXL,
//     pageLimitation: adminCustomizeContainer.state.pageLimitationXL,
//     switchPageListLimitationS: adminCustomizeContainer.switchPageListLimitation(),
//   },
// };

// dropdownOpenGroup, pageLimitationGroup, switchPageListLimitationGrpup
// isDropdownOpenS, pageLimitationS, switchPageListLimitationS

class CustomizeFunctionSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // isDropdownOpenS: false, // S
      // isDropdownOpenM: false, // M
      // isDropdownOpenL: false, // L
      // isDropdownOpenXL: false, // XL

      isDropdownOpen: '',
    };

    this.onToggleDropdown = this.onToggleDropdown.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  onToggleDropdown(size) {
    this.setState({
      // [`isDropdownOpen${size}`]: !this.state[`isDropdownOpen${size}`],
      isDropdownOpen: size,
    });
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


  // renderDropButtons(dropdownOpenGroup, pageLimitationGroup, switchPageListLimitationGrpup) {
  //   const { t, adminCustomizeContainer } = this.props;
  //   return (
  //     <div>
  //       {Object.entries(dropdownGroupMapping).map(([key, value]) => {
  //         return (
  //           // <NavItem key={key} type="button" className={`p-0 nav-link ${activeTab === key && 'active'}`}>
  //           //   <NavLink onClick={() => { switchActiveTab(key) }}>
  //           //     {value.icon}
  //           //     {t(value.i18n)}
  //           //   </NavLink>
  //           // </NavItem>
  //           <div className="form-group row">
  //             <div className="offset-md-3 col-md-6 text-left">
  //               <div className="my-0 w-100">
  //                 <label>{t('admin:customize_setting.function_options.list_num_s')}</label>
  //               </div>
  //               <Dropdown isOpen={this.state.dropdownOpenGroup} toggle={this.onToggleDropdownS}>
  //                 <DropdownToggle className="text-right col-6" caret>
  //                   <span className="float-left">{adminCustomizeContainer.state.pageLimitationGroup}</span>
  //                 </DropdownToggle>
  //                 <DropdownMenu className="dropdown-menu" role="menu">
  //                   <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitation(10) }}>
  //                     <a role="menuitem">10</a>
  //                   </DropdownItem>
  //                   <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitation(30) }}>
  //                     <a role="menuitem">30</a>
  //                   </DropdownItem>
  //                   <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitation(50) }}>
  //                     <a role="menuitem">50</a>
  //                   </DropdownItem>
  //                 </DropdownMenu>
  //               </Dropdown>
  //               <p className="form-text text-muted">
  //                 {t('admin:customize_setting.function_options.list_num_desc_s')}
  //               </p>
  //             </div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // }

  render() {
    const { t, adminCustomizeContainer } = this.props;

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

            {/* S: Modal */}
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="my-0 w-100">
                  <label>{t('admin:customize_setting.function_options.list_num_s')}</label>
                </div>
                <Dropdown isOpen={this.state.isDropdownOpen === 'S'} toggle={() => this.onToggleDropdown('S')}>
                  <DropdownToggle className="text-right col-6" caret>
                    <span className="float-left">{adminCustomizeContainer.state.pageLimitationS}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationS(10) }}>
                      <a role="menuitem">10</a>
                    </DropdownItem>
                    <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationS(30) }}>
                      <a role="menuitem">30</a>
                    </DropdownItem>
                    <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationS(50) }}>
                      <a role="menuitem">50</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <p className="form-text text-muted">
                  {t('admin:customize_setting.function_options.list_num_desc_s')}
                </p>
              </div>
            </div>

            {/* M: User Page */}
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="my-0 w-100">
                  <label>{t('admin:customize_setting.function_options.list_num_m')}</label>
                </div>
                <Dropdown isOpen={this.state.isDropdownOpen === 'M'} toggle={() => this.onToggleDropdown('M')}>
                  <DropdownToggle className="text-right col-6" caret>
                    <span className="float-left">{adminCustomizeContainer.state.pageLimitationM}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationM(10) }}>
                      <a role="menuitem">10</a>
                    </DropdownItem>
                    <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationM(30) }}>
                      <a role="menuitem">30</a>
                    </DropdownItem>
                    <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationM(50) }}>
                      <a role="menuitem">50</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <p className="form-text text-muted">
                  {t('admin:customize_setting.function_options.list_num_desc_m')}
                </p>
              </div>
            </div>

            {/* L: Search / Draft Pages */}
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="my-0 w-100">
                  <label>{t('admin:customize_setting.function_options.list_num_l')}</label>
                </div>
                <Dropdown isOpen={this.state.isDropdownOpen === 'L'} toggle={() => this.onToggleDropdown('L')}>
                  <DropdownToggle className="text-right col-6" caret>
                    <span className="float-left">{adminCustomizeContainer.state.pageLimitationL}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationL(10) }}>
                      <a role="menuitem">10</a>
                    </DropdownItem>
                    <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationL(30) }}>
                      <a role="menuitem">30</a>
                    </DropdownItem>
                    <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationL(50) }}>
                      <a role="menuitem">50</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <p className="form-text text-muted">
                  {t('admin:customize_setting.function_options.list_num_desc_l')}
                </p>
              </div>
            </div>

            {/* XL: NotFound / Trash Pages */}
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="my-0 w-100">
                  <label>{t('admin:customize_setting.function_options.list_num_xl')}</label>
                </div>
                <Dropdown isOpen={this.state.isDropdownOpen === 'XL'} toggle={() => this.onToggleDropdown('XL')}>
                  <DropdownToggle className="text-right col-6" caret>
                    <span className="float-left">{adminCustomizeContainer.state.pageLimitationXL}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationXL(10) }}>
                      <a role="menuitem">10</a>
                    </DropdownItem>
                    <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationXL(30) }}>
                      <a role="menuitem">30</a>
                    </DropdownItem>
                    <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchPageListLimitationXL(50) }}>
                      <a role="menuitem">50</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <p className="form-text text-muted">
                  {t('admin:customize_setting.function_options.list_num_desc_xl')}
                </p>
              </div>
            </div>

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
