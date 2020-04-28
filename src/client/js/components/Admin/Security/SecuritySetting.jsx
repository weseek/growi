/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

class SecuritySetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      retrieveError: null,
    };
    this.putSecuritySetting = this.putSecuritySetting.bind(this);
  }

  async componentDidMount() {
    const { adminGeneralSecurityContainer } = this.props;

    try {
      await adminGeneralSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
      this.setState({ retrieveError: err.message });
    }
  }

  async putSecuritySetting() {
    const { t, adminGeneralSecurityContainer } = this.props;
    try {
      await adminGeneralSecurityContainer.updateGeneralSecuritySetting();
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer } = this.props;
    const { currentRestrictGuestMode, currentPageCompleteDeletionAuthority } = adminGeneralSecurityContainer.state;

    return (
      <React.Fragment>
        <h2 className="alert-anchor border-bottom">
          {t('security_settings')}
        </h2>
        {this.state.retrieveError != null && (
        <div className="alert alert-danger">
          <p>{t('Error occurred')} : {this.state.retrieveError}</p>
        </div>
          )}

        <table className="table col-md-8">
          <thead>
            <tr>
              <th scope="col">ページの公開範囲</th>
              <th scope="col">設定値</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{ t('Public') }</th>
              <td>表示(固定)</td>
            </tr>
            <tr>
              <th scope="row">{ t('Anyone with the link') }</th>
              <td>非表示(固定)</td>
            </tr>
            <tr>
              <th scope="row">{ t('Just me') }</th>
              <td>[switch] 表示/非表示</td>
            </tr>
            <tr>
              <th scope="row">{ t('Only inside the group') }</th>
              <td>
                <div className="custom-control custom-switch custom-checkbox-success">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="isLocalEnabled"
                    onChange={() => adminGeneralSecurityContainer.switchIsLocalEnabled()}
                  />
                  <label className="custom-control-label" htmlFor="isLocalEnabled">
                    {t('security_setting.Local.enable_local')}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ゲストユーザーのアクセス */}
        <div className="row mb-5">
          <div className="col-md-3 text-md-right text-nowrap py-2 mr-md-5">
            <strong>{t('security_setting.Guest Users Access')}</strong>
          </div>
          <div className="col-md-6 ml-md-5">
            <div className="dropdown">
              <button
                className={`btn btn-outline-secondary dropdown-toggle ${adminGeneralSecurityContainer.isWikiModeForced && 'disabled'}`}
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                {currentRestrictGuestMode === 'Deny' && t('security_setting.guest_mode.deny')}
                {currentRestrictGuestMode === 'Readonly' && t('security_setting.guest_mode.readonly')}
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a className="dropdown-item" onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Deny') }}>
                  {t('security_setting.guest_mode.deny')}
                </a>
                <a className="dropdown-item" onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Readonly') }}>
                  {t('security_setting.guest_mode.readonly')}
                </a>
              </div>
            </div>
          </div>
        </div>
        {adminGeneralSecurityContainer.isWikiModeForced && (
        <div className="row mb-5">
          <div className="col-xs-offset-3 col-xs-6 text-left">
            <p className="alert alert-warning mt-2 text-left">
              <i className="icon-exclamation icon-fw">
              </i><b>FIXED</b><br />
              <b
                dangerouslySetInnerHTML={{
                    __html: t('security_setting.Fixed by env var',
                    { forcewikimode: 'FORCE_WIKI_MODE', wikimode: adminGeneralSecurityContainer.state.wikiMode }),
                    }}
              />
            </p>
          </div>
        </div>
          )}

        {/* テーブルにする */}
        {/* <div className="row mb-5">
          <strong className="col-md-3 text-md-right text-nowrap mb-2 mr-md-5" dangerouslySetInnerHTML={{ __html: t('security_setting.page_listing_1') }} />
          <div className="col-md-6">
            <div className="custom-control custom-checkbox custom-checkbox-success ml-md-5">
              <input
                type="checkbox"
                className="custom-control-input"
                id="isShowRestrictedByOwner"
                checked={adminGeneralSecurityContainer.state.isShowRestrictedByOwner}
                onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByOwner() }}
              />
              <label className="custom-control-label" htmlFor="isShowRestrictedByOwner">
                {t('security_setting.page_listing_1_desc')}
              </label>
            </div>
          </div>
        </div> */}

        {/* <div className="row mb-5">
          <strong className="col-md-3 text-md-right text-nowrap mr-md-5 mb-2" dangerouslySetInnerHTML={{ __html: t('security_setting.page_listing_2') }} />
          <div className="col-md-6 ml-md-5">
            <div className="custom-control custom-checkbox custom-checkbox-success">
              <input
                type="checkbox"
                className="custom-control-input"
                id="isShowRestrictedByGroup"
                checked={adminGeneralSecurityContainer.state.isShowRestrictedByGroup}
                onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByGroup() }}
              />
              <label className="custom-control-label" htmlFor="isShowRestrictedByGroup">
                {t('security_setting.page_listing_2_desc')}
              </label>
            </div>
          </div>
        </div> */}

        <div className="row mb-5">
          <div className="col-md-3 text-md-right mr-md-5 mb-2">
            <strong>{t('security_setting.complete_deletion')}</strong>
          </div>
          <div className="col-md-6 ml-md-5">
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                {currentPageCompleteDeletionAuthority === 'anyOne' && t('security_setting.anyone')}
                {currentPageCompleteDeletionAuthority === 'adminOnly' && t('security_setting.admin_only')}
                {(currentPageCompleteDeletionAuthority === 'adminAndAuthor' || currentPageCompleteDeletionAuthority == null)
                    && t('security_setting.admin_and_author')}
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a className="dropdown-item" onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('anyOne') }}>
                  {t('security_setting.anyone')}
                </a>
                <a className="dropdown-item" onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('adminOnly') }}>
                  {t('security_setting.admin_only')}
                </a>
                <a className="dropdown-item" onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('adminAndAuthor') }}>
                  {t('security_setting.admin_and_author')}
                </a>
              </div>
              <p className="form-text text-muted small">
                {t('security_setting.complete_deletion_explain')}
              </p>
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="offset-3 col-5">
            <button type="button" className="btn btn-primary" disabled={this.state.retrieveError != null} onClick={this.putSecuritySetting}>
              {t('Update')}
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

SecuritySetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  csrf: PropTypes.string,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const SecuritySettingWrapper = (props) => {
  return createSubscribedElement(SecuritySetting, props, [AppContainer, AdminGeneralSecurityContainer]);
};

export default withTranslation()(SecuritySettingWrapper);
