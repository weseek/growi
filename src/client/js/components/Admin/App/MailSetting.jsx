import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import {
  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import SmtpSetting from './SmtpSetting';

const logger = loggerFactory('growi:mailSettings');

class MailSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'smtp-setting',
      // Prevent unnecessary rendering
      activeComponents: new Set(['smtp-setting']),
    };

    this.emailInput = React.createRef();
    this.hostInput = React.createRef();
    this.portInput = React.createRef();
    this.userInput = React.createRef();
    this.passwordInput = React.createRef();

    this.submitFromAdressHandler = this.submitFromAdressHandler.bind(this);
  }

  toggleActiveTab(activeTab) {
    this.setState({
      activeTab, activeComponents: this.state.activeComponents.add(activeTab),
    });
  }

  async submitFromAdressHandler() {
    const { t, adminAppContainer } = this.props;

    try {
      await adminAppContainer.updateFromAdressHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.mail_settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminAppContainer } = this.props;
    const { activeTab, activeComponents } = this.state;

    return (
      <React.Fragment>
        <p className="card well">{t('admin:app_setting.smtp_used')} {t('admin:app_setting.smtp_but_aws')}<br />{t('admin:app_setting.neihter_of')}</p>
        <div className="row form-group mb-5">
          <label className="col-md-3 col-form-label text-left">{t('admin:app_setting.from_e-mail_address')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              ref={this.emailInput}
              placeholder={`${t('eg')} mail@growi.org`}
              defaultValue={adminAppContainer.state.fromAddress || ''}
              onChange={(e) => { adminAppContainer.changeFromAddress(e.target.value) }}
            />
          </div>
        </div>
        <div className="row my-3">
          <div className="mx-auto">
            <button type="button" className="btn btn-primary" onClick={this.submitFromAdressHandler}>{ t('Update') }</button>
          </div>
        </div>

        <Nav tabs>
          <NavItem>
            <NavLink
              className={`${activeTab === 'smtp-setting' && 'active'} `}
              onClick={() => { this.toggleActiveTab('smtp-setting') }}
              href="#smtp-setting"
            >
              SMTP
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`${activeTab === 'ses-setting' && 'active'} `}
              onClick={() => { this.toggleActiveTab('ses-setting') }}
              href="#ses-setting"
            >
              SES(AWS)
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="smtp-setting">
            {activeComponents.has('smtp-setting') && <SmtpSetting />}
          </TabPane>
          <TabPane tabId="ses-setting">
            {activeComponents.has('ses-setting') && <p>TBD</p>}
          </TabPane>
        </TabContent>
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const MailSettingWrapper = withUnstatedContainers(MailSetting, [AppContainer, AdminAppContainer]);

MailSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(MailSettingWrapper);
