import React from 'react';
import { WithTranslation } from 'next-i18next';

import { i18n, config as nextI18NextConfig, withTranslation } from '~/i18n';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AdminAppContainer from '../../../services/AdminAppContainer';
// import { AdminUpdateButtonRow } from '~/components/Admin/Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:appSettings');

interface Props extends WithTranslation {
  adminAppContainer: AdminAppContainer,
}

type MyState = { isMounted: boolean };
class AppSetting extends React.Component<Props, MyState> {

  constructor(props) {
    super(props);

    this.state = {
      isMounted: false,
    };

    this.submitHandler = this.submitHandler.bind(this);
    this.renderRadioButtonsForDefaultLanguage = this.renderRadioButtonsForDefaultLanguage.bind(this);
  }

  componentDidMount() {
    this.setState({
      isMounted: true,
    });
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

  renderRadioButtonsForDefaultLanguage = (): JSX.Element => {
    const elements: JSX.Element[] = nextI18NextConfig.allLanguages.map((lang) => {
      const { adminAppContainer } = this.props;
      const fixedT = i18n.getFixedT(lang);
      i18n.loadLanguages(nextI18NextConfig.allLanguages);

      return (
        <div key={lang} className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id={`radioLang${lang}`}
            className="custom-control-input"
            name="globalLang"
            value={lang}
            checked={adminAppContainer.state.globalLang === lang}
            onChange={(e) => {
              adminAppContainer.changeGlobalLang(e.target.value);
            }}
          />
          <label className="custom-control-label" htmlFor={`radioLang${lang}`}>{fixedT('meta.display_name')}</label>
        </div>
      );
    });

    return <>{elements}</>;
  };

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
            {this.state.isMounted && this.renderRadioButtonsForDefaultLanguage()}
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
                checked={adminAppContainer.state.fileUpload != null}
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

        {/* <AdminUpdateButtonRow onClick={this.submitHandler} disabled={adminAppContainer.state.retrieveError != null} /> */}
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
export default withUnstatedContainers(withTranslation()(AppSetting), [AdminAppContainer]);
