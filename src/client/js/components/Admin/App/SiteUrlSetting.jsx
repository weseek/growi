import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:appSettings');

class SiteUrlSetting extends React.Component {

  constructor(props) {
    super(props);

    this.submitHandler = this.submitHandler.bind(this);
  }

  async submitHandler() {
    const { t, adminAppContainer } = this.props;

    try {
      await adminAppContainer.updateSiteUrlSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('Site URL settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminAppContainer } = this.props;

    return (
      <React.Fragment>
        <p className="well">{t('admin:app_setting.site_url_desc')}</p>
        {!adminAppContainer.state.isSetSiteUrl
          && (<p className="alert alert-danger"><i className="icon-exclamation"></i> {t('admin:app_setting.site_url_warn')}</p>)}

        <div className="row">
          <div className="col-md-12">
            <div className="col-xs-offset-3">
              <table className="table settings-table">
                <colgroup>
                  <col className="from-db" />
                  <col className="from-env-vars" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Database</th>
                    <th>Environment variables</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input
                        className="form-control"
                        type="text"
                        name="settingForm[app:siteUrl]"
                        defaultValue={adminAppContainer.state.siteUrl || ''}
                        onChange={(e) => { adminAppContainer.changeSiteUrl(e.target.value) }}
                        placeholder="e.g. https://my.growi.org"
                      />
                      <p className="help-block">
                        {/* eslint-disable-next-line react/no-danger */}
                        <span dangerouslySetInnerHTML={{ __html: t('admin:app_setting.siteurl_help') }} />
                      </p>
                    </td>
                    <td>
                      <input className="form-control" type="text" value={adminAppContainer.state.envSiteUrl || ''} readOnly />
                      <p className="help-block">
                        {/* eslint-disable-next-line react/no-danger */}
                        <span dangerouslySetInnerHTML={{ __html: t('admin:app_setting.use_env_var_if_empty', { variable: 'APP_SITE_URL' }) }} />
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.submitHandler} disabled={adminAppContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SiteUrlSettingWrapper = (props) => {
  return createSubscribedElement(SiteUrlSetting, props, [AppContainer, AdminAppContainer]);
};

SiteUrlSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(SiteUrlSettingWrapper);
