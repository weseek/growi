import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { toastError } from '../../../util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminHomeContainer from '../../../services/AdminHomeContainer';
import SystemInfomationTable from './SystemInfomationTable';
import InstalledPluginTable from './InstalledPluginTable';
import EnvVarsTable from './EnvVarsTable';

const logger = loggerFactory('growi:admin');

class AdminHome extends React.Component {

  async componentDidMount() {
    const { adminHomeContainer } = this.props;

    try {
      await adminHomeContainer.retrieveAdminHomeData();
    }
    catch (err) {
      toastError(err);
      adminHomeContainer.setState({ retrieveError: err });
      logger.error(err);
    }
  }

  render() {
    const { t, adminHomeContainer } = this.props;

    return (
      <Fragment>
        <p>
          {t('admin:admin_top.wiki_administrator')}
          <br></br>
          {t('admin:admin_top.assign_administrator')}
        </p>

        <div className="row mb-5">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('admin:admin_top.system_information')}</h2>
            <SystemInfomationTable />
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('admin:admin_top.list_of_installed_plugins')}</h2>
            <InstalledPluginTable />
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-md-12">
            <h2 className="admin-setting-header">{t('admin:admin_top.list_of_env_vars')}</h2>
            <p>{t('admin:admin_top.env_var_priority')}</p>
            {/* eslint-disable-next-line react/no-danger */}
            <p dangerouslySetInnerHTML={{ __html: t('admin:admin_top.about_security') }} />
            {adminHomeContainer.state.envVars && <EnvVarsTable envVars={adminHomeContainer.state.envVars} />}
          </div>
        </div>
      </Fragment>
    );
  }

}

const AdminHomeWrapper = withUnstatedContainers(AdminHome, [AppContainer, AdminHomeContainer]);

AdminHome.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminHomeContainer: PropTypes.instanceOf(AdminHomeContainer).isRequired,
};

export default withTranslation()(AdminHomeWrapper);
