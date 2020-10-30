import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { localeMetadatas } from '../../../util/i18n';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AdminAppContainer from '../../../services/AdminAppContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:appSettings');

class AppSetting extends React.Component {

  constructor(props) {
    super(props);

    this.submitHandler = this.submitHandler.bind(this);
  }

  async submitHandler() {
    const { t, adminAppContainer } = this.props;

    try {
      await adminAppContainer.updateAppSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('App Settings') }));
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
        <div className="form-group row">
          <label className="text-left text-md-right col-md-3 col-form-label">{t('admin:app_setting.site_name')}</label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.title || ''}
              onChange={(e) => {
                adminAppContainer.changeTitle(e.target.value);
              }}
              placeholder="GROWI"
            />
            <p className="form-text text-muted">{t('admin:app_setting.sitename_change')}</p>
          </div>
        </div>

        <div className="row form-group mb-5">
          <label
            className="text-left text-md-right col-md-3 col-form-label"
          >
            {t('admin:app_setting.confidential_name')}
          </label>
          <div className="col-md-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.confidential || ''}
              onChange={(e) => {
                adminAppContainer.changeConfidential(e.target.value);
              }}
              placeholder={t('admin:app_setting.confidential_example')}
            />
            <p className="form-text text-muted">{t('admin:app_setting.header_content')}</p>
          </div>
        </div>

        <div className="row form-group mb-5">
          <label
            className="text-left text-md-right col-md-3 col-form-label"
          >
            {t('admin:app_setting.default_language')}
          </label>
          <div className="col-md-6 py-2">
            {
              localeMetadatas.map(meta => (
                <div key={meta.id} className="custom-control custom-radio custom-control-inline">
                  <input
                    type="radio"
                    id={`radioLang${meta.id}`}
                    className="custom-control-input"
                    name="globalLang"
                    value={meta.id}
                    checked={adminAppContainer.state.globalLang === meta.id}
                    onChange={(e) => {
                      adminAppContainer.changeGlobalLang(e.target.value);
                    }}
                  />
                  <label className="custom-control-label" htmlFor={`radioLang${meta.id}`}>{meta.displayName}</label>
                </div>
              ))
            }
          </div>
        </div>

        <div className="row form-group mb-5">
          <label
            className="text-left text-md-right col-md-3 col-form-label"
          >
            {t('admin:app_setting.file_uploading')}
          </label>
          <div className="col-md-6">
            <div className="custom-control custom-checkbox custom-checkbox-info">
              <input
                type="checkbox"
                id="cbFileUpload"
                className="custom-control-input"
                name="fileUpload"
                checked={adminAppContainer.state.fileUpload}
                onChange={(e) => {
                  adminAppContainer.changeFileUpload(e.target.checked);
                }}
              />
              <label
                className="custom-control-label"
                htmlFor="cbFileUpload"
              >
                {t('admin:app_setting.enable_files_except_image')}
              </label>
            </div>

            <p className="form-text text-muted">
              {t('admin:app_setting.attach_enable')}
            </p>
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
const AppSettingWrapper = withUnstatedContainers(AppSetting, [AdminAppContainer]);

AppSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(AppSettingWrapper);
