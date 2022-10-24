import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:appSettings');


type Props = {
  adminAppContainer: AdminAppContainer,
}

const SiteUrlSetting = (props: Props) => {
  const { t } = useTranslation();
  const { adminAppContainer } = props;


  const submitHandler = useCallback(async() => {
    try {
      await adminAppContainer.updateSiteUrlSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('Site URL settings'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }, [adminAppContainer, t]);

  return (
    <React.Fragment>
      <p className="card well">{t('admin:app_setting.site_url_desc')}</p>
      {!adminAppContainer.state.isSetSiteUrl
          && (<p className="alert alert-danger"><i className="icon-exclamation"></i> {t('admin:app_setting.site_url_warn')}</p>)}

      <div className="row form-group">
        <div className="col-md-9 offset-md-3">
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
                  <p className="form-text text-muted">
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('admin:app_setting.siteurl_help') }} />
                  </p>
                </td>
                <td>
                  <input className="form-control" type="text" value={adminAppContainer.state.envSiteUrl || ''} readOnly />
                  <p className="form-text text-muted">
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('admin:app_setting.use_env_var_if_empty', { variable: 'APP_SITE_URL' }) }} />
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AdminUpdateButtonRow onClick={submitHandler} disabled={adminAppContainer.state.retrieveError != null} />
    </React.Fragment>
  );
};

/**
 * Wrapper component for using unstated
 */
const SiteUrlSettingWrapper = withUnstatedContainers(SiteUrlSetting, [AdminAppContainer]);

export default SiteUrlSettingWrapper;
