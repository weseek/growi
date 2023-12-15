import React, { useEffect } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminImportContainer from '~/client/services/AdminImportContainer';
import { toastError } from '~/client/util/toastr';
import { toArrayIfNot } from '~/utils/array-utils';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';

import GrowiArchiveSection from './GrowiArchiveSection';

const logger = loggerFactory('growi:importer');

class ImportDataPageContents extends React.Component {

  render() {
    const { t, adminImportContainer } = this.props;

    return (
      <div data-testid="admin-import-data">
        <GrowiArchiveSection />

        <form
          className="mt-5"
          id="importerSettingFormEsa"
          role="form"
        >
          <fieldset>
            <h2 className="admin-setting-header">{t('importer_management.import_from', { from: 'esa.io' })}</h2>
            <table className="table table-bordered table-mapping">
              <thead>
                <tr>
                  <th width="45%">esa.io</th>
                  <th width="10%"></th>
                  <th>GROWI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{t('importer_management.article')}</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{t('importer_management.page')}</th>
                </tr>
                <tr>
                  <th>{t('importer_management.category')}</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{t('importer_management.page_path')}</th>
                </tr>
                <tr>
                  <th>{t('User')}</th>
                  <th></th>
                  <th>(TBD)</th>
                </tr>
              </tbody>
            </table>

            <div className="card custom-card mb-0 small">
              <ul>
                <li>{t('importer_management.page_skip')}</li>
              </ul>
            </div>

            <div className="row">
              <input type="password" name="dummypass" style={{ display: 'none', top: '-100px', left: '-100px' }} />
            </div>

            <div className="row">
              <label htmlFor="settingForm[importer:esa:team_name]" className="text-start text-md-end col-md-3 col-form-label">
                {t('importer_management.esa_settings.team_name')}
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="esaTeamName"
                  value={adminImportContainer.state.esaTeamName || ''}
                  onChange={adminImportContainer.handleInputValue}
                />
              </div>

            </div>

            <div className="row">
              <label htmlFor="settingForm[importer:esa:access_token]" className="text-start text-md-end col-md-3 col-form-label">
                {t('importer_management.esa_settings.access_token')}
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="password"
                  name="esaAccessToken"
                  value={adminImportContainer.state.esaAccessToken || ''}
                  onChange={adminImportContainer.handleInputValue}
                />
              </div>
            </div>

            <div className="row">
              <div className="offset-md-3 col-md-6">
                <input
                  id="testConnectionToEsa"
                  type="button"
                  className="btn btn-primary btn-esa"
                  name="Esa"
                  onClick={adminImportContainer.esaHandleSubmit}
                  value={t('importer_management.import')}
                />
                <input type="button" className="btn btn-secondary" onClick={adminImportContainer.esaHandleSubmitUpdate} value={t('Update')} />
                <span className="offset-0 offset-sm-1">
                  <input
                    id="importFromEsa"
                    type="button"
                    name="Esa"
                    className="btn btn-secondary btn-esa"
                    onClick={adminImportContainer.esaHandleSubmitTest}
                    value={t('importer_management.esa_settings.test_connection')}
                  />
                </span>

              </div>
            </div>
          </fieldset>
        </form>

        <form
          className="mt-5"
          id="importerSettingFormQiita"
          role="form"
        >
          <fieldset>
            <h2 className="admin-setting-header">{t('importer_management.import_from', { from: 'Qiita:Team' })}</h2>
            <table className="table table-bordered table-mapping">
              <thead>
                <tr>
                  <th width="45%">Qiita:Team</th>
                  <th width="10%"></th>
                  <th>GROWI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{t('importer_management.article')}</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{t('importer_management.page')}</th>
                </tr>
                <tr>
                  <th>{t('importer_management.tag')}</th>
                  <th></th>
                  <th>-</th>
                </tr>
                <tr>
                  <th>{t('importer_management.Directory_hierarchy_tag')}</th>
                  <th></th>
                  <th>(TBD)</th>
                </tr>
                <tr>
                  <th>{t('User')}</th>
                  <th></th>
                  <th>(TBD)</th>
                </tr>
              </tbody>
            </table>
            <div className="card custom-card mb-0 small">
              <ul>
                <li>{t('importer_management.page_skip')}</li>
              </ul>
            </div>

            <div className="row">
              <input type="password" name="dummypass" style={{ display: 'none', top: '-100px', left: '-100px' }} />
            </div>
            <div className="row">
              <label htmlFor="settingForm[importer:qiita:team_name]" className="text-start text-md-end col-md-3 col-form-label">
                {t('importer_management.qiita_settings.team_name')}
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="qiitaTeamName"
                  value={adminImportContainer.state.qiitaTeamName || ''}
                  onChange={adminImportContainer.handleInputValue}
                />
              </div>
            </div>

            <div className="row">
              <label htmlFor="settingForm[importer:qiita:access_token]" className="text-start text-md-end col-md-3 col-form-label">
                {t('importer_management.qiita_settings.access_token')}
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="password"
                  name="qiitaAccessToken"
                  value={adminImportContainer.state.qiitaAccessToken || ''}
                  onChange={adminImportContainer.handleInputValue}
                />
              </div>
            </div>


            <div className="row">
              <div className="offset-md-3 col-md-6">
                <input
                  id="testConnectionToQiita"
                  type="button"
                  className="btn btn-primary btn-qiita"
                  name="Qiita"
                  onClick={adminImportContainer.qiitaHandleSubmit}
                  value={t('importer_management.import')}
                />
                <input type="button" className="btn btn-secondary" onClick={adminImportContainer.qiitaHandleSubmitUpdate} value={t('Update')} />
                <span className="offset-0 offset-sm-1">
                  <input
                    name="Qiita"
                    type="button"
                    id="importFromQiita"
                    className="btn btn-secondary btn-qiita"
                    onClick={adminImportContainer.qiitaHandleSubmitTest}
                    value={t('importer_management.qiita_settings.test_connection')}
                  />
                </span>

              </div>
            </div>


          </fieldset>


        </form>
      </div>
    );
  }

}

ImportDataPageContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminImportContainer: PropTypes.instanceOf(AdminImportContainer).isRequired,
};

const ImportDataPageContentsWrapperFc = (props) => {
  const { t } = useTranslation('admin');

  const { adminImportContainer } = props;

  useEffect(() => {
    const fetchImportSettingsData = async() => {
      await adminImportContainer.retrieveImportSettingsData();
    };

    try {
      fetchImportSettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminImportContainer]);

  return <ImportDataPageContents t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const ImportDataPageContentsWrapper = withUnstatedContainers(ImportDataPageContentsWrapperFc, [AdminImportContainer]);

export default ImportDataPageContentsWrapper;
