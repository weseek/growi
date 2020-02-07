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
    const helpPageListingByOwner = { __html: t('security_setting.page_listing_1') };
    const helpPageListingByGroup = { __html: t('security_setting.page_listing_2') };
    // eslint-disable-next-line max-len
    const helpForceWikiMode = { __html: t('security_setting.Fixed by env var', { forcewikimode: 'FORCE_WIKI_MODE', wikimode: adminGeneralSecurityContainer.state.wikiMode }) };


    return (
      <React.Fragment>
        <fieldset>
          <h2 className="alert-anchor border-bottom">
            {t('security_settings')}
          </h2>
          {this.state.retrieveError != null && (
            <div className="alert alert-danger">
              <p>{t('Error occurred')} : {this.state.retrieveError}</p>
            </div>
          )}
          <div className="row mb-5">
            <strong className="col-xs-3 text-right"> {t('security_setting.Guest Users Access')} </strong>
            <div className="col-xs-9 text-left">
              <div className="my-0 btn-group">
                <div className="dropdown">
                  <button
                    className="btn btn-default dropdown-toggle w-100"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    disabled={adminGeneralSecurityContainer.state.isWikiModeForced}
                  >
                    <span className="pull-left">
                      {currentRestrictGuestMode === 'Deny' && t('security_setting.guest_mode.deny')}
                      {currentRestrictGuestMode === 'Readonly' && t('security_setting.guest_mode.readonly')}
                    </span>
                    <span className="bs-caret pull-right">
                      <span className="caret" />
                    </span>
                  </button>
                  {/* TODO adjust dropdown after BS4 */}
                  <ul className="dropdown-menu" role="menu">
                    <li
                      key="Deny"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Deny') }}
                    >
                      <a role="menuitem">{t('security_setting.guest_mode.deny')}</a>
                    </li>
                    <li
                      key="Readonly"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Readonly') }}
                    >
                      <a role="menuitem">{t('security_setting.guest_mode.readonly')}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {adminGeneralSecurityContainer.state.isWikiModeForced && (
            <div className="row mb-5">
              <div className="col-xs-3 text-right" />
              <div className="col-xs-9 text-left">
                <p className="alert alert-warning mt-2 text-left">
                  <i className="icon-exclamation icon-fw">
                  </i><b>FIXED</b><br />
                  {<b dangerouslySetInnerHTML={helpForceWikiMode} />}
                </p>
              </div>
            </div>
          )}
          <div className="row mb-5">
            <strong className="col-xs-3 text-right" dangerouslySetInnerHTML={helpPageListingByOwner} />
            <div className="col-xs-6 text-left">
              <div className="checkbox checkbox-success">
                <input
                  id="isShowRestrictedByOwner"
                  type="checkbox"
                  checked={adminGeneralSecurityContainer.state.isShowRestrictedByOwner}
                  onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByOwner() }}
                />
                <label htmlFor="isShowRestrictedByOwner">
                  {t('security_setting.page_listing_1_desc')}
                </label>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <strong className="col-xs-3 text-right" dangerouslySetInnerHTML={helpPageListingByGroup} />
            <div className="col-xs-6 text-left">
              <div className="checkbox checkbox-success">
                <input
                  id="isShowRestrictedByGroup"
                  type="checkbox"
                  checked={adminGeneralSecurityContainer.state.isShowRestrictedByGroup}
                  onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByGroup() }}
                />
                <label htmlFor="isShowRestrictedByGroup">
                  {t('security_setting.page_listing_2_desc')}
                </label>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <strong className="col-xs-3 text-right"> {t('security_setting.complete_deletion')} </strong>
            <div className="col-xs-9 text-left">
              <div className="my-0 btn-group">
                <div className="dropdown">
                  <button className="btn btn-default dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="pull-left">
                      {currentPageCompleteDeletionAuthority === 'anyOne' && t('security_setting.anyone')}
                      {currentPageCompleteDeletionAuthority === 'adminOnly' && t('security_setting.admin_only')}
                      {(currentPageCompleteDeletionAuthority === 'adminAndAuthor' || currentPageCompleteDeletionAuthority == null)
                        && t('security_setting.admin_and_author')}
                    </span>
                    <span className="bs-caret pull-right">
                      <span className="caret" />
                    </span>
                  </button>
                  {/* TODO adjust dropdown after BS4 */}
                  <ul className="dropdown-menu" role="menu">
                    <li
                      key="anyone"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('anyOne') }}
                    >
                      <a role="menuitem">{t('security_setting.anyone')}</a>
                    </li>
                    <li
                      key="admin_only"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('adminOnly') }}
                    >
                      <a role="menuitem">{t('security_setting.admin_only')}</a>
                    </li>
                    <li
                      key="admin_and_author"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('adminAndAuthor') }}
                    >
                      <a role="menuitem">{t('security_setting.admin_and_author')}</a>
                    </li>
                  </ul>
                </div>
                <p className="help-block small">
                  {t('security_setting.complete_deletion_explain')}
                </p>
              </div>
            </div>
          </div>
          <div className="row my-3">
            <div className="col-xs-offset-3 col-xs-5">
              <button type="submit" className="btn btn-primary" disabled={this.state.retrieveError != null} onClick={this.putSecuritySetting}>
                {t('Update')}
              </button>
            </div>
          </div>
        </fieldset>
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
