/* eslint-disable react/no-danger */
import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';

import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { PageDeleteConfigValue } from '~/interfaces/page-delete-config';
import { validateDeleteConfigs, prepareDeleteConfigValuesForCalc } from '~/utils/page-delete-config';

import { withUnstatedContainers } from '../../UnstatedUtils';

// used as the prefix of translation
const DeletionTypeForT = Object.freeze({
  Deletion: 'deletion',
  CompleteDeletion: 'complete_deletion',
  RecursiveDeletion: 'recursive_deletion',
  RecursiveCompleteDeletion: 'recursive_complete_deletion',
});

const DeletionType = Object.freeze({
  Deletion: 'deletion',
  CompleteDeletion: 'completeDeletion',
  RecursiveDeletion: 'recursiveDeletion',
  RecursiveCompleteDeletion: 'recursiveCompleteDeletion',
});

const getDeletionTypeForT = (deletionType) => {
  switch (deletionType) {
    case DeletionType.Deletion:
      return DeletionTypeForT.Deletion;
    case DeletionType.RecursiveDeletion:
      return DeletionTypeForT.RecursiveDeletion;
    case DeletionType.CompleteDeletion:
      return DeletionTypeForT.CompleteDeletion;
    case DeletionType.RecursiveCompleteDeletion:
      return DeletionTypeForT.RecursiveCompleteDeletion;
  }
};

const getDeleteConfigValueForT = (DeleteConfigValue) => {
  switch (DeleteConfigValue) {
    case PageDeleteConfigValue.Anyone:
    case null:
      return 'security_settings.anyone';
    case PageDeleteConfigValue.Inherit:
      return 'security_settings.inherit';
    case PageDeleteConfigValue.AdminOnly:
      return 'security_settings.admin_only';
    case PageDeleteConfigValue.AdminAndAuthor:
      return 'security_settings.admin_and_author';
  }
};

/**
 * Return true if "deletionType" is DeletionType.RecursiveDeletion or DeletionType.RecursiveCompleteDeletion.
 * @param deletionType Deletion type
 * @returns boolean
 */
const isRecursiveDeletion = (deletionType) => {
  return deletionType === DeletionType.RecursiveDeletion || deletionType === DeletionType.RecursiveCompleteDeletion;
};

/**
 * Return true if "deletionType" is DeletionType.Deletion or DeletionType.RecursiveDeletion.
 * @param deletionType Deletion type
 * @returns boolean
 */
const isTypeDeletion = (deletionType) => {
  return deletionType === DeletionType.Deletion || deletionType === DeletionType.RecursiveDeletion;
};

class SecuritySetting extends React.Component {

  constructor(props) {
    super(props);

    // functions
    this.putSecuritySetting = this.putSecuritySetting.bind(this);
    this.getRecursiveDeletionConfigState = this.getRecursiveDeletionConfigState.bind(this);
    this.previousPageRecursiveAuthorityState = this.previousPageRecursiveAuthorityState.bind(this);
    this.setPagePreviousRecursiveAuthorityState = this.setPagePreviousRecursiveAuthorityState.bind(this);
    this.expantDeleteOptionsState = this.expantDeleteOptionsState.bind(this);
    this.setExpantOtherDeleteOptionsState = this.setExpantOtherDeleteOptionsState.bind(this);
    this.setDeletionConfigState = this.setDeletionConfigState.bind(this);

    // render
    this.renderPageDeletePermission = this.renderPageDeletePermission.bind(this);
    this.renderPageDeletePermissionDropdown = this.renderPageDeletePermissionDropdown.bind(this);
  }

  async putSecuritySetting() {
    const { t, adminGeneralSecurityContainer } = this.props;
    try {
      await adminGeneralSecurityContainer.updateGeneralSecuritySetting();
      toastSuccess(t('security_settings.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }
  }

  getRecursiveDeletionConfigState(deletionType) {
    const { adminGeneralSecurityContainer } = this.props;

    if (isTypeDeletion(deletionType)) {
      return [
        adminGeneralSecurityContainer.state.currentPageRecursiveDeletionAuthority,
        adminGeneralSecurityContainer.changePageRecursiveDeletionAuthority,
      ];
    }

    return [
      adminGeneralSecurityContainer.state.currentPageRecursiveCompleteDeletionAuthority,
      adminGeneralSecurityContainer.changePageRecursiveCompleteDeletionAuthority,
    ];
  }

  previousPageRecursiveAuthorityState(deletionType) {
    const { adminGeneralSecurityContainer } = this.props;

    return isTypeDeletion(deletionType)
      ? adminGeneralSecurityContainer.state.previousPageRecursiveDeletionAuthority
      : adminGeneralSecurityContainer.state.previousPageRecursiveCompleteDeletionAuthority;
  }

  setPagePreviousRecursiveAuthorityState(deletionType, previousState) {
    const { adminGeneralSecurityContainer } = this.props;

    if (isTypeDeletion(deletionType)) {
      adminGeneralSecurityContainer.changePreviousPageRecursiveDeletionAuthority(previousState);
      return;
    }

    adminGeneralSecurityContainer.changePreviousPageRecursiveCompleteDeletionAuthority(previousState);
  }

  expantDeleteOptionsState(deletionType) {
    const { adminGeneralSecurityContainer } = this.props;

    return isTypeDeletion(deletionType)
      ? adminGeneralSecurityContainer.state.expandOtherOptionsForDeletion
      : adminGeneralSecurityContainer.state.expandOtherOptionsForCompleteDeletion;
  }

  setExpantOtherDeleteOptionsState(deletionType, bool) {
    const { adminGeneralSecurityContainer } = this.props;

    if (isTypeDeletion(deletionType)) {
      adminGeneralSecurityContainer.switchExpandOtherOptionsForDeletion(bool);
      return;
    }
    adminGeneralSecurityContainer.switchExpandOtherOptionsForCompleteDeletion(bool);
    return;
  }

  /**
   * Force update deletion config for recursive operation when the deletion config for general operation is updated.
   * @param deletionType Deletion type
   */
  setDeletionConfigState(newState, setState, deletionType) {
    setState(newState);

    if (this.previousPageRecursiveAuthorityState(deletionType) !== null) {
      this.setPagePreviousRecursiveAuthorityState(deletionType, null);
    }

    if (isRecursiveDeletion(deletionType)) {
      return;
    }

    const [recursiveState, setRecursiveState] = this.getRecursiveDeletionConfigState(deletionType);

    const calculableValue = prepareDeleteConfigValuesForCalc(newState, recursiveState);
    const shouldForceUpdate = !validateDeleteConfigs(calculableValue[0], calculableValue[1]);
    if (shouldForceUpdate) {
      setRecursiveState(newState);
      this.setPagePreviousRecursiveAuthorityState(deletionType, recursiveState);
      this.setExpantOtherDeleteOptionsState(deletionType, true);
    }

    return;
  }

  renderPageDeletePermissionDropdown(currentState, setState, deletionType, isButtonDisabled) {
    const { t } = this.props;
    return (
      <div className="dropdown">
        <button
          className="btn btn-outline-secondary dropdown-toggle text-right"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="true"
        >
          <span className="float-left">
            {t(getDeleteConfigValueForT(currentState))}
          </span>
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {
            isRecursiveDeletion(deletionType)
              ? (
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={() => { this.setDeletionConfigState(PageDeleteConfigValue.Inherit, setState, deletionType) }}
                >
                  {t('security_settings.inherit')}
                </button>
              )
              : (
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={() => { this.setDeletionConfigState(PageDeleteConfigValue.Anyone, setState, deletionType) }}
                >
                  {t('security_settings.anyone')}
                </button>
              )
          }
          <button
            className={`dropdown-item ${isButtonDisabled ? 'disabled' : ''}`}
            type="button"
            onClick={() => { this.setDeletionConfigState(PageDeleteConfigValue.AdminAndAuthor, setState, deletionType) }}
          >
            {t('security_settings.admin_and_author')}
          </button>
          <button
            className="dropdown-item"
            type="button"
            onClick={() => { this.setDeletionConfigState(PageDeleteConfigValue.AdminOnly, setState, deletionType) }}
          >
            {t('security_settings.admin_only')}
          </button>
        </div>
        <p className="form-text text-muted small">
          {t(`security_settings.${getDeletionTypeForT(deletionType)}_explain`)}
        </p>
      </div>
    );
  }

  renderPageDeletePermission(currentState, setState, deletionType, isButtonDisabled) {
    const { t } = this.props;

    const expantDeleteOptionsState = this.expantDeleteOptionsState(deletionType);

    return (
      <div key={`page-delete-permission-dropdown-${deletionType}`} className="row">

        <div className="col-md-3 text-md-right">
          {!isRecursiveDeletion(deletionType) && isTypeDeletion(deletionType) && (
            <strong>{t('security_settings.page_delete')}</strong>
          )}
          {!isRecursiveDeletion(deletionType) && !isTypeDeletion(deletionType) && (
            <strong>{t('security_settings.page_delete_completely')}</strong>
          )}
        </div>

        <div className="col-md-6">
          {
            !isRecursiveDeletion(deletionType)
              ? (
                <>{this.renderPageDeletePermissionDropdown(currentState, setState, deletionType, isButtonDisabled)}</>
              )
              : (
                <>
                  <button
                    type="button"
                    className="btn btn-link p-0 mb-4"
                    aria-expanded="false"
                    onClick={() => this.setExpantOtherDeleteOptionsState(deletionType, !expantDeleteOptionsState)}
                  >
                    <i className={`fa fa-fw fa-arrow-right ${expantDeleteOptionsState ? 'fa-rotate-90' : ''}`}></i>
                    { t('security_settings.other_options') }
                  </button>
                  <Collapse isOpen={expantDeleteOptionsState}>
                    <div className="pb-4">
                      <p className="card well">
                        <span className="text-warning">
                          <i className="icon-info"></i>
                          {/* eslint-disable-next-line react/no-danger */}
                          <span dangerouslySetInnerHTML={{ __html: t('security_settings.page_delete_rights_caution') }} />
                        </span>
                      </p>
                      { this.previousPageRecursiveAuthorityState(deletionType) !== null && (
                        <div className="mb-3">
                          <strong>
                            {t('security_settings.forced_update_desc')}
                          </strong>
                          <code>
                            {t(getDeleteConfigValueForT(this.previousPageRecursiveAuthorityState(deletionType)))}
                          </code>
                        </div>
                      )}
                      {this.renderPageDeletePermissionDropdown(currentState, setState, deletionType, isButtonDisabled)}
                    </div>
                  </Collapse>
                </>
              )
          }
        </div>
      </div>
    );
  }

  render() {
    const { t, adminGeneralSecurityContainer } = this.props;
    const {
      currentRestrictGuestMode, currentPageDeletionAuthority, currentPageCompleteDeletionAuthority,
      currentPageRecursiveDeletionAuthority, currentPageRecursiveCompleteDeletionAuthority,
    } = adminGeneralSecurityContainer.state;

    const isButtonDisabledForDeletion = !validateDeleteConfigs(
      adminGeneralSecurityContainer.state.currentPageDeletionAuthority, PageDeleteConfigValue.AdminAndAuthor,
    );

    const isButtonDisabledForCompleteDeletion = !validateDeleteConfigs(
      adminGeneralSecurityContainer.state.currentPageCompleteDeletionAuthority, PageDeleteConfigValue.AdminAndAuthor,
    );

    return (
      <React.Fragment>
        <h2 className="alert-anchor border-bottom">
          {t('security_settings.security_settings')}
        </h2>

        {adminGeneralSecurityContainer.retrieveError != null && (
          <div className="alert alert-danger">
            <p>{t('Error occurred')} : {adminGeneralSecurityContainer.retrieveError}</p>
          </div>
        )}

        <h4 className="mt-4">{ t('security_settings.page_list_and_search_results') }</h4>
        <div className="row justify-content-md-center">
          <table className="table table-bordered col-lg-9 mb-5">
            <thead>
              <tr>
                <th scope="col">{ t('security_settings.scope_of_page_disclosure') }</th>
                <th scope="col">{ t('security_settings.set_point') }</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{ t('public') }</th>
                <td><i className="icon-fw icon-check text-success"></i>{ t('security_settings.always_displayed') }</td>
              </tr>
              <tr>
                <th scope="row">{ t('anyone_with_the_link') }</th>
                <td><i className="icon-fw icon-ban text-danger"></i>{ t('security_settings.always_hidden') }</td>
              </tr>
              <tr>
                <th scope="row">{ t('only_me') }</th>
                <td>
                  <div className="custom-control custom-switch custom-checkbox-success">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="isShowRestrictedByOwner"
                      checked={!adminGeneralSecurityContainer.state.isShowRestrictedByOwner}
                      onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByOwner() }}
                    />
                    <label className="custom-control-label" htmlFor="isShowRestrictedByOwner">
                      {t('security_settings.displayed_or_hidden')}
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <th scope="row">{ t('only_inside_the_group') }</th>
                <td>
                  <div className="custom-control custom-switch custom-checkbox-success">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="isShowRestrictedByGroup"
                      checked={!adminGeneralSecurityContainer.state.isShowRestrictedByGroup}
                      onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByGroup() }}
                    />
                    <label className="custom-control-label" htmlFor="isShowRestrictedByGroup">
                      {t('security_settings.displayed_or_hidden')}
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>{t('security_settings.page_access_rights')}</h4>
        <div className="row mb-4">
          <div className="col-md-3 text-md-right py-2">
            <strong>{t('security_settings.Guest Users Access')}</strong>
          </div>
          <div className="col-md-9">
            <div className="dropdown">
              <button
                className={`btn btn-outline-secondary dropdown-toggle text-right col-12
                            col-md-auto ${adminGeneralSecurityContainer.isWikiModeForced && 'disabled'}`}
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                <span className="float-left">
                  {currentRestrictGuestMode === 'Deny' && t('security_settings.guest_mode.deny')}
                  {currentRestrictGuestMode === 'Readonly' && t('security_settings.guest_mode.readonly')}
                </span>
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <button className="dropdown-item" type="button" onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Deny') }}>
                  {t('security_settings.guest_mode.deny')}
                </button>
                <button className="dropdown-item" type="button" onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Readonly') }}>
                  {t('security_settings.guest_mode.readonly')}
                </button>
              </div>
            </div>
            {adminGeneralSecurityContainer.isWikiModeForced && (
              <p className="alert alert-warning mt-2 col-6">
                <i className="icon-exclamation icon-fw">
                </i><b>FIXED</b><br />
                <b
                  dangerouslySetInnerHTML={{
                    __html: t('security_settings.Fixed by env var',
                      { key: 'FORCE_WIKI_MODE', value: adminGeneralSecurityContainer.state.wikiMode }),
                  }}
                />
              </p>
            )}
          </div>
        </div>

        <h4>{t('security_settings.page_delete_rights')}</h4>
        {/* Render PageDeletePermission */}
        {
          [
            [currentPageDeletionAuthority, adminGeneralSecurityContainer.changePageDeletionAuthority, DeletionType.Deletion, false],
            // eslint-disable-next-line max-len
            [currentPageRecursiveDeletionAuthority, adminGeneralSecurityContainer.changePageRecursiveDeletionAuthority, DeletionType.RecursiveDeletion, isButtonDisabledForDeletion],
          ].map(arr => this.renderPageDeletePermission(arr[0], arr[1], arr[2], arr[3]))
        }
        {
          [
            [currentPageCompleteDeletionAuthority, adminGeneralSecurityContainer.changePageCompleteDeletionAuthority, DeletionType.CompleteDeletion, false],
            // eslint-disable-next-line max-len
            [currentPageRecursiveCompleteDeletionAuthority, adminGeneralSecurityContainer.changePageRecursiveCompleteDeletionAuthority, DeletionType.RecursiveCompleteDeletion, isButtonDisabledForCompleteDeletion],
          ].map(arr => this.renderPageDeletePermission(arr[0], arr[1], arr[2], arr[3]))
        }

        <h4>{t('security_settings.user_home_page_deletion.user_home_page_deletion')}</h4>
        <div className="row mb-4">
          <div className="col-6 offset-3">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                type="checkbox"
                className="custom-control-input"
                id="is-user-page-deletion-enabled"
                checked={adminGeneralSecurityContainer.state.isUserPageDeletionEnabled}
                onChange={() => { adminGeneralSecurityContainer.switchisUserPageDeletionEnabled() }}
              />
              <label className="custom-control-label" htmlFor="is-user-page-deletion-enabled">
                {t('security_settings.user_home_page_deletion.enable_user_home_page_deletion')}
              </label>
            </div>
            <p
              className="form-text text-muted small"
              dangerouslySetInnerHTML={{ __html: t('security_settings.user_home_page_deletion.when_deleting_a_user_the_user_home_page_is_also_deleted') }}
            />
          </div>
        </div>

        <h4>{t('security_settings.session')}</h4>
        <div className="form-group row">
          <label className="text-left text-md-right col-md-3 col-form-label">{t('security_settings.max_age')}</label>
          <div className="col-md-6">
            <input
              className="form-control col-md-3"
              type="text"
              defaultValue={adminGeneralSecurityContainer.state.sessionMaxAge || ''}
              onChange={(e) => {
                adminGeneralSecurityContainer.setSessionMaxAge(e.target.value);
              }}
              placeholder="2592000000"
            />
            {/* eslint-disable-next-line react/no-danger */}
            <p className="form-text text-muted" dangerouslySetInnerHTML={{ __html: t('security_settings.max_age_desc') }} />
            <p className="card well">
              <span className="text-warning">
                <i className="icon-info"></i> {t('security_settings.max_age_caution')}
              </span>
            </p>
          </div>
        </div>

        <div className="row my-3">
          <div className="text-center text-md-left offset-md-3 col-md-5">
            <button type="button" className="btn btn-primary" disabled={adminGeneralSecurityContainer.retrieveError != null} onClick={this.putSecuritySetting}>
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
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const SecuritySettingWrapperFC = (props) => {
  const { t } = useTranslation('admin');
  return <SecuritySetting t={t} {...props} />;
};

const SecuritySettingWrapper = withUnstatedContainers(SecuritySettingWrapperFC, [AdminGeneralSecurityContainer]);

export default SecuritySettingWrapper;
