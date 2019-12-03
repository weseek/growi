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

    this.putSecuritySetting = this.putSecuritySetting.bind(this);
  }

  async putSecuritySetting() {
    const { t } = this.props;
    try {
      await this.props.adminGeneralSecurityContainer.updateGeneralSecuritySetting();
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer } = this.props;
    const helpPageListingByOwner = { __html: t('security_setting.page_listing_1') };
    const helpPageListingByGroup = { __html: t('security_setting.page_listing_2') };
    return (
      <React.Fragment>
        <fieldset>
          <legend className="alert-anchor">{ t('security_settings') }</legend>
          {/* TODO adjust layout */}
          <div className="row mb-5">
            <strong className="col-xs-3 text-right"> { t('security_setting.Guest Users Access') } </strong>
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
                    <span className="pull-left">{t(`security_setting.guest_mode.${adminGeneralSecurityContainer.state.currentRestrictGuestMode}`)}</span>
                    <span className="bs-caret pull-right">
                      <span className="caret" />
                    </span>
                  </button>
                  {/* TODO adjust dropdown after BS4 */}
                  <ul className="dropdown-menu" role="menu">
                    <li
                      key="deny"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('deny') }}
                    >
                      <a role="menuitem">{ t('security_setting.guest_mode.deny') }</a>
                    </li>
                    <li
                      key="readonly"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('readonly') }}
                    >
                      <a role="menuitem">{ t('security_setting.guest_mode.readonly') }</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {adminGeneralSecurityContainer.state.isWikiModeForced && (
            <div className="row mb-5">
              <div className="col-xs-6">
                <p className="alert alert-warning mt-2">
                  <i className="icon-exclamation icon-fw">
                  </i><b>FIXED</b>
                  { t('security_setting.Fixed by env var', 'FORCE_WIKI_MODE') }<br></br>
                </p>
              </div>
            </div>
          )}
          <div className="row mb-5">
            <strong className="col-xs-3 text-right" dangerouslySetInnerHTML={helpPageListingByOwner} />
            <div className="col-xs-6 text-left">
              <div className="checkbox checkbox-success">
                <input
                  id="isHideRestrictedByOwner"
                  type="checkbox"
                  checked={adminGeneralSecurityContainer.state.isHideRestrictedByOwner}
                  onChange={() => { adminGeneralSecurityContainer.switchIsHideRestrictedByOwner() }}
                />
                <label htmlFor="isHideRestrictedByOwner">
                  <p className="help-block small">{ t('security_setting.page_listing_1_desc') }</p>
                </label>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <strong className="col-xs-3 text-right" dangerouslySetInnerHTML={helpPageListingByGroup} />
            <div className="col-xs-6 text-left">
              <div className="checkbox checkbox-success">
                <input
                  id="isHideRestrictedByGroup"
                  type="checkbox"
                  checked={adminGeneralSecurityContainer.state.isHideRestrictedByGroup}
                  onChange={() => { adminGeneralSecurityContainer.switchIsHideRestrictedByGroup() }}
                />
                <label htmlFor="isHideRestrictedByGroup">
                  <p className="help-block small">{ t('security_setting.page_listing_2_desc') }</p>
                </label>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <strong className="col-xs-3 text-right"> { t('security_setting.complete_deletion') } </strong>
            <div className="col-xs-9 text-left">
              <div className="my-0 btn-group">
                <div className="dropdown">
                  <button className="btn btn-default dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="pull-left">{t(`security_setting.${adminGeneralSecurityContainer.state.currentpageCompleteDeletionAuthority}`)}</span>
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
                      onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('anyone') }}
                    >
                      <a role="menuitem">{ t('security_setting.anyone') }</a>
                    </li>
                    <li
                      key="admin_only"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('admin_only') }}
                    >
                      <a role="menuitem">{ t('security_setting.admin_only') }</a>
                    </li>
                    <li
                      key="admin_and_author"
                      role="presentation"
                      type="button"
                      onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('admin_and_author') }}
                    >
                      <a role="menuitem">{ t('security_setting.admin_and_author') }</a>
                    </li>
                  </ul>
                  <p className="help-block small">
                    { t('security_setting.complete_deletion_explain') }
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* TODO GW-540 */}
          <div className="form-group">
            <div className="col-xs-offset-3 col-xs-6">
              <input type="hidden" name="_csrf" value={this.props.csrf} />
              <button type="submit" className="btn btn-primary" onClick={this.putSecuritySetting}>{ t('Update') }</button>
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
