import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withUnstatedContainers } from '../../UnstatedUtils';

import GrowiArchiveSection from './GrowiArchiveSection';

import AdminImportContainer from '../../../services/AdminImportContainer';

class ImportDataPageContents extends React.Component {

  render() {
    const { t, adminImportContainer } = this.props;

    return (
      <Fragment>
        <GrowiArchiveSection />

        <form
          className="mt-5"
          id="importerSettingFormEsa"
          role="form"
        >
          <fieldset>
            <h2 className="admin-setting-header">{t('admin:importer_management.import_from', { from: 'esa.io' })}</h2>
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
                  <th>{t('Article')}</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{t('Page')}</th>
                </tr>
                <tr>
                  <th>{t('Category')}</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{t('Page Path')}</th>
                </tr>
                <tr>
                  <th>{t('User')}</th>
                  <th></th>
                  <th>(TBD)</th>
                </tr>
              </tbody>
            </table>

            <div className="card well mb-0 small">
              <ul>
                <li>{t('admin:importer_management.page_skip')}</li>
              </ul>
            </div>

            <div className="form-group row">
              <input type="password" name="dummypass" style={{ display: 'none', top: '-100px', left: '-100px' }} />
            </div>

            <div className="form-group row">
              <label htmlFor="settingForm[importer:esa:team_name]" className="text-left text-md-right col-md-3 col-form-label">
                {t('admin:importer_management.esa_settings.team_name')}
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="esaTeamName"
                  value={adminImportContainer.state.esaTeamName}
                  onChange={adminImportContainer.handleInputValue}
                />
              </div>

            </div>

            <div className="form-group row">
              <label htmlFor="settingForm[importer:esa:access_token]" className="text-left text-md-right col-md-3 col-form-label">
                {t('admin:importer_management.esa_settings.access_token')}
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="password"
                  name="esaAccessToken"
                  value={adminImportContainer.state.esaAccessToken}
                  onChange={adminImportContainer.handleInputValue}
                />
              </div>
            </div>

            <div className="form-group row">
              <div className="offset-md-3 col-md-6">
                <input
                  id="testConnectionToEsa"
                  type="button"
                  className="btn btn-primary btn-esa"
                  name="Esa"
                  onClick={adminImportContainer.esaHandleSubmit}
                  value={t('admin:importer_management.import')}
                />
                <input type="button" className="btn btn-secondary" onClick={adminImportContainer.esaHandleSubmitUpdate} value={t('Update')} />
                <span className="offset-0 offset-sm-1">
                  <input
                    id="importFromEsa"
                    type="button"
                    name="Esa"
                    className="btn btn-secondary btn-esa"
                    onClick={adminImportContainer.esaHandleSubmitTest}
                    value={t('admin:importer_management.esa_settings.test_connection')}
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
            <h2 className="admin-setting-header">{t('admin:importer_management.import_from', { from: 'Qiita:Team' })}</h2>
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
                  <th>{t('Article')}</th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>{t('Page')}</th>
                </tr>
                <tr>
                  <th>{t('Tag')}</th>
                  <th></th>
                  <th>-</th>
                </tr>
                <tr>
                  <th>{t('admin:importer_management.Directory_hierarchy_tag')}</th>
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
            <div className="card well mb-0 small">
              <ul>
                <li>{t('admin:importer_management.page_skip')}</li>
              </ul>
            </div>

            <div className="form-group row">
              <input type="password" name="dummypass" style={{ display: 'none', top: '-100px', left: '-100px' }} />
            </div>
            <div className="form-group row">
              <label htmlFor="settingForm[importer:qiita:team_name]" className="text-left text-md-right col-md-3 col-form-label">
                {t('admin:importer_management.qiita_settings.team_name')}
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="qiitaTeamName"
                  value={adminImportContainer.state.qiitaTeamName}
                  onChange={adminImportContainer.handleInputValue}
                />
              </div>
            </div>

            <div className="form-group row">
              <label htmlFor="settingForm[importer:qiita:access_token]" className="text-left text-md-right col-md-3 col-form-label">
                {t('admin:importer_management.qiita_settings.access_token')}
              </label>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="password"
                  name="qiitaAccessToken"
                  value={adminImportContainer.stateqiitaAccessToken}
                  onChange={adminImportContainer.handleInputValue}
                />
              </div>
            </div>


            <div className="form-group row">
              <div className="offset-md-3 col-md-6">
                <input
                  id="testConnectionToQiita"
                  type="button"
                  className="btn btn-primary btn-qiita"
                  name="Qiita"
                  onClick={adminImportContainer.qiitaHandleSubmit}
                  value={t('admin:importer_management.import')}
                />
                <input type="button" className="btn btn-secondary" onClick={adminImportContainer.qiitaHandleSubmitUpdate} value={t('Update')} />
                <span className="offset-0 offset-sm-1">
                  <input
                    name="Qiita"
                    type="button"
                    id="importFromQiita"
                    className="btn btn-secondary btn-qiita"
                    onClick={adminImportContainer.qiitaHandleSubmitTest}
                    value={t('admin:importer_management.qiita_settings.test_connection')}
                  />
                </span>

              </div>
            </div>


          </fieldset>


        </form>
      </Fragment>
    );
  }

}

ImportDataPageContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminImportContainer: PropTypes.instanceOf(AdminImportContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ImportDataPageContentsWrapper = withUnstatedContainers(GrowiArchiveSection, [AdminImportContainer]);

export default withTranslation()(ImportDataPageContentsWrapper);
