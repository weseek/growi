import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip } from 'reactstrap';
import loggerFactory from '~/utils/logger';

import { toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import AdminHomeContainer from '~/client/services/AdminHomeContainer';
import AdminAppContainer from '~/client/services/AdminAppContainer';
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
    const { isV5Compatible } = adminHomeContainer.state;

    let alertStyle = 'alert-info';
    if (isV5Compatible == null) alertStyle = 'alert-warning';

    return (
      <Fragment>
        {
          // not show if true
          !isV5Compatible
          && (
            <div className={`alert ${alertStyle}`}>
              {t('admin:v5_page_migration.migration_desc')}
              <a className="btn-link" href="/admin/app" rel="noopener noreferrer">
                <i className="fa fa-link ml-1" aria-hidden="true"></i>
                <strong>{t('admin:v5_page_migration.upgrade_to_v5')}</strong>
              </a>
            </div>
          )
        }
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

        <div className="row mb-5">
          <div className="col-md-12">
            <h2 className="admin-setting-header">{t('admin:admin_top.bug_report')}</h2>
            <div className="d-flex align-items-center">
              <CopyToClipboard
                text={adminHomeContainer.generatePrefilledHostInformationMarkdown()}
                onCopy={() => adminHomeContainer.onCopyPrefilledHostInformation()}
              >
                <button id="prefilledHostInformationButton" type="button" className="btn btn-primary">
                  {t('admin:admin_top:copy_prefilled_host_information:default')}
                </button>
              </CopyToClipboard>
              <Tooltip
                placement="bottom"
                isOpen={adminHomeContainer.state.copyState === adminHomeContainer.copyStateValues.DONE}
                target="prefilledHostInformationButton"
                fade={false}
              >
                {t('admin:admin_top:copy_prefilled_host_information:done')}
              </Tooltip>
              {/* eslint-disable-next-line react/no-danger */}
              <span className="ml-2" dangerouslySetInnerHTML={{ __html: t('admin:admin_top:submit_bug_report') }} />
            </div>
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
