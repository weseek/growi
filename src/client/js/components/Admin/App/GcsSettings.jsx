
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';


function GcsSetting(props) {
  const { t, adminAppContainer } = props;

  return (
    <table className="table settings-table">
      <colgroup>
        <col className="item-name" />
        <col className="from-db" />
        <col className="from-env-vars" />
      </colgroup>
      <thead>
        <tr><th></th><th>Database</th><th>Environment variables</th></tr>
      </thead>
      <tbody>
        <tr>
          <th>Api Key Json Path</th>
          <td>
            <input
              className="form-control"
              type="text"
              name="gcsApiKeyJsonPath"
              defaultValue={adminAppContainer.state.gcsApiKeyJsonPath}
              onChange={e => adminAppContainer.changeGcsApiKeyJsonPath(e.target.value)}
            />
          </td>
          <td>
            <input
              className="form-control"
              type="text"
              value={adminAppContainer.state.envGcsApiKeyJsonPath || ''}
              readOnly
              tabIndex="-1"
            />
            <p className="form-text text-muted">
              {/* eslint-disable-next-line react/no-danger */}
              <small dangerouslySetInnerHTML={{ __html: t('admin:app_setting.use_env_var_if_empty', { variable: 'GCS_API_KEY_JSON_PATH' }) }} />
            </p>
          </td>
        </tr>
        <tr>
          <th>{t('admin:app_setting.bucket_name')}</th>
          <td>
            <input
              className="form-control"
              type="text"
              name="gcsBucket"
              defaultValue={adminAppContainer.state.gcsBucket}
              onChange={e => adminAppContainer.changeGcsBucket(e.target.value)}
            />
          </td>
          <td>
            <input
              className="form-control"
              type="text"
              value={adminAppContainer.state.envGcsBucket || ''}
              readOnly
              tabIndex="-1"
            />
            <p className="form-text text-muted">
              {/* eslint-disable-next-line react/no-danger */}
              <small dangerouslySetInnerHTML={{ __html: t('admin:app_setting.use_env_var_if_empty', { variable: 'GCS_BUCKET' }) }} />
            </p>
          </td>
        </tr>
        <tr>
          <th>Name Space</th>
          <td>
            <input
              className="form-control"
              type="text"
              name="gcsUploadNamespace"
              defaultValue={adminAppContainer.state.gcsUploadNamespace}
              onChange={e => adminAppContainer.changeGcsUploadNamespace(e.target.value)}
            />
          </td>
          <td>
            <input
              className="form-control"
              type="text"
              value={adminAppContainer.state.envGcsUploadNamespace || ''}
              readOnly
              tabIndex="-1"
            />
            <p className="form-text text-muted">
              {/* eslint-disable-next-line react/no-danger */}
              <small dangerouslySetInnerHTML={{ __html: t('admin:app_setting.use_env_var_if_empty', { variable: 'GCS_UPLOAD_NAMESPACE' }) }} />
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );

}

/**
 * Wrapper component for using unstated
 */
const GcsSettingWrapper = withUnstatedContainers(GcsSetting, [AppContainer, AdminAppContainer]);

GcsSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(GcsSettingWrapper);
