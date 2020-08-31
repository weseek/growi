import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
// import loggerFactory from '@alias/logger';

import {
  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';
import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import AwsSetting from './AwsSetting';
import GcpSettings from './GcpSettings';

// const logger = loggerFactory('growi:FileUploadSetting');

class FileUploadSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'aws-setting',
      // Prevent unnecessary rendering
      activeComponents: new Set(['aws-setting']),
    };

  }

  toggleActiveTab(activeTab) {
    this.setState({
      activeTab, activeComponents: this.state.activeComponents.add(activeTab),
    });
  }

  render() {
    const { t } = this.props;
    const { activeTab, activeComponents } = this.state;

    return (
      <React.Fragment>
        <p className="card well my-3">
          {t('admin:app_setting.aws_access')}
          <br />
          {t('admin:app_setting.no_smtp_setting')}
          <br />
          <br />
          <span className="text-danger">
            <i className="ti-unlink"></i>
            {t('admin:app_setting.change_setting')}
          </span>
        </p>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={`${activeTab === 'aws-setting' && 'active'} `}
              onClick={() => { this.toggleActiveTab('aws-setting') }}
              href="#smtp-setting"
            >
              {t('admin:app_setting.aws_settings')}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`${activeTab === 'gcp-setting' && 'active'} `}
              onClick={() => { this.toggleActiveTab('gcp-setting') }}
              href="#ses-setting"
            >
              {t('admin:app_setting.gcp_settings')}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab} className="pt-3">
          <TabPane tabId="aws-setting">
            {activeComponents.has('aws-setting') && <AwsSetting />}
          </TabPane>
          <TabPane tabId="gcp-setting">
            {activeComponents.has('gcp-setting') && <GcpSettings />}
          </TabPane>
        </TabContent>
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const FileUploadSettingWrapper = withUnstatedContainers(FileUploadSetting, [AppContainer, AdminAppContainer]);

FileUploadSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(FileUploadSettingWrapper);
