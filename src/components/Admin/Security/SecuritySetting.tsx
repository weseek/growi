/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-danger */
import React, { FC, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import {
  DropdownMenu, DropdownItem, DropdownToggle, UncontrolledDropdown,
} from 'reactstrap';
import { useTranslation } from '~/i18n';
import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { useSecuritySettingGeneralSWR } from '~/stores/admin';
import { apiv3Put } from '~/utils/apiv3-client';


const sessionMaxAge = 'sessionMaxAge';
const restrictGuestMode = 'restrictGuestMode';
const pageCompleteDeletionAuthority = 'pageCompleteDeletionAuthority';
const hideRestrictedByOwner = 'hideRestrictedByOwner';
const hideRestrictedByGroup = 'hideRestrictedByGroup';
const wikiMode = 'wikiMode';

type FormValues = {
  [sessionMaxAge]: string,
  [restrictGuestMode]: string,
  [pageCompleteDeletionAuthority]: string,
  [hideRestrictedByOwner]: string,
  [hideRestrictedByGroup]: string,
  [wikiMode]: string,
};


export const SecuritySetting: FC = () => {
  const { t } = useTranslation();
  const { data, error } = useSecuritySettingGeneralSWR();
  const {
    register, control, handleSubmit, setValue, watch,
  } = useForm({
    defaultValues: {
      [sessionMaxAge]: data?.[sessionMaxAge] || null,
      [restrictGuestMode]: data?.[restrictGuestMode] || null,
      [pageCompleteDeletionAuthority]: data?.[pageCompleteDeletionAuthority] || null,
      [hideRestrictedByOwner]: data?.[hideRestrictedByOwner],
      [hideRestrictedByGroup]: data?.[hideRestrictedByGroup],
      [wikiMode]: data?.[wikiMode],
    },
  });
  const selectedCurrentRestrictGuestMode = watch(restrictGuestMode);
  const selectedPageCompleteDeletionAuthority = watch(pageCompleteDeletionAuthority);

  const submitHandler: SubmitHandler<FormValues> = async(formValues) => {
    try {
      await apiv3Put('/security-setting/general-setting', {
        [sessionMaxAge]: formValues[sessionMaxAge],
        [restrictGuestMode]: formValues[restrictGuestMode],
        [pageCompleteDeletionAuthority]: formValues[pageCompleteDeletionAuthority],
        [hideRestrictedByOwner]: formValues[hideRestrictedByOwner],
        [hideRestrictedByGroup]: formValues[hideRestrictedByGroup],
        [wikiMode]: formValues[wikiMode],
      });
      toastSuccess(t('security_setting.updated_general_security_setting'));
    }
    catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    setValue(sessionMaxAge, data?.[sessionMaxAge]);
    setValue(restrictGuestMode, data?.[restrictGuestMode]);
    setValue(pageCompleteDeletionAuthority, data?.[pageCompleteDeletionAuthority]);
    setValue(hideRestrictedByOwner, data?.[hideRestrictedByOwner]);
    setValue(hideRestrictedByGroup, data?.[hideRestrictedByGroup]);
    setValue(wikiMode, data?.[wikiMode]);
  }, [
    data?.[sessionMaxAge],
    data?.[restrictGuestMode],
    data?.[pageCompleteDeletionAuthority],
    data?.[hideRestrictedByOwner],
    data?.[hideRestrictedByGroup],
    data?.[wikiMode],
  ]);

  return (
    <div className="row">
      <form role="form" className="col-md-12" onSubmit={handleSubmit(submitHandler)}>
        <h2 className="alert-anchor border-bottom">
          {t('security_settings')}
        </h2>

        {error != null && (
        <div className="alert alert-danger">
          <p>{t('Error occurred')} : {error}</p>
        </div>
        )}

        <h4 className="mt-4">{ t('security_setting.page_list_and_search_results') }</h4>
        <table className="table table-bordered col-lg-9 mb-5">
          <thead>
            <tr>
              <th scope="col">{ t('scope_of_page_disclosure') }</th>
              <th scope="col">{ t('set_point') }</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{ t('Public') }</th>
              <td>{ t('always_displayed') }</td>
            </tr>
            <tr>
              <th scope="row">{ t('Anyone with the link') }</th>
              <td>{ t('always_hidden') }</td>
            </tr>
            <tr>
              <th scope="row">{ t('Only me') }</th>
              <td>
                <div className="custom-control custom-switch custom-checkbox-success">
                  <input
                    name={hideRestrictedByOwner}
                    type="checkbox"
                    className="custom-control-input"
                    id="hideRestrictedByOwner"
                    ref={register}
                  />
                  <label className="custom-control-label" htmlFor="hideRestrictedByOwner">
                    {t('displayed_or_hidden')}
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">{ t('Only inside the group') }</th>
              <td>
                <div className="custom-control custom-switch custom-checkbox-success">
                  <input
                    name={hideRestrictedByGroup}
                    type="checkbox"
                    className="custom-control-input"
                    id="hideRestrictedByGroup"
                    ref={register}
                  />
                  <label className="custom-control-label" htmlFor="hideRestrictedByGroup">
                    {t('displayed_or_hidden')}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <h4>{t('security_setting.page_access_and_delete_rights')}</h4>
        <div className="row mb-4">
          <div className="col-md-3 text-md-right py-2">
            <strong>{t('security_setting.Guest Users Access')}</strong>
          </div>
          <div className="col-md-9">
            <Controller
              name={restrictGuestMode}
              control={control}
              render={({ onChange }) => {
                return (
                  <UncontrolledDropdown>
                    <DropdownToggle
                      className="text-right btn-outline-secondary col-12 col-md-auto"
                      color="transparent"
                      disabled={data?.wikiMode === ('private' || 'public')}
                      caret
                    >
                      <span className="float-left text-muted">
                        { selectedCurrentRestrictGuestMode === 'Deny' && t('security_setting.guest_mode.deny') }
                        { selectedCurrentRestrictGuestMode === 'Readonly' && t('security_setting.guest_mode.readonly') }
                      </span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu" role="menu">
                      {['Deny', 'Readonly'].map((word) => {
                        return (
                          <DropdownItem
                            key={word}
                            role="presentation"
                            onClick={() => onChange(word)}
                          >
                            <a role="menuitem">
                              {word === 'Deny' ? t('security_setting.guest_mode.deny') : t('security_setting.guest_mode.readonly')}
                            </a>
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                 );
               }}
            />
            {data?.wikiMode === ('private' || 'public') && (
            <p className="alert alert-warning mt-2 text-left offset-3 col-6">
              <i className="icon-exclamation icon-fw">
              </i><b>FIXED</b><br />
              <b
                dangerouslySetInnerHTML={{
                  __html: t('security_setting.Fixed by env var',
                    { forcewikimode: 'FORCE_WIKI_MODE', wikimode: wikiMode }),
                }}
              />
            </p>
          )}
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-3 text-md-right mb-2">
            <strong>{t('security_setting.complete_deletion')}</strong>
          </div>
          <div className="col-md-6">
            <Controller
              name={pageCompleteDeletionAuthority}
              control={control}
              render={({ onChange }) => {
            return (
              <UncontrolledDropdown>
                <DropdownToggle
                  className="text-right btn-outline-secondary col-12 col-md-auto"
                  color="transparent"
                  caret
                >
                  <span className="float-left text-muted">
                    { selectedPageCompleteDeletionAuthority === 'anyOne' && t('security_setting.anyone')}
                    { selectedPageCompleteDeletionAuthority === 'adminOnly' && t('security_setting.admin_only')}
                    { selectedPageCompleteDeletionAuthority === 'adminAndAuthor' && t('security_setting.admin_and_author')}
                  </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu" role="menu">
                  {['anyOne', 'adminOnly', 'adminAndAuthor'].map((word) => {
                    return (
                      <DropdownItem
                        key={word}
                        role="presentation"
                        onClick={() => onChange(word)}
                      >
                        <a role="menuitem">
                          {word === 'anyOne' && t('security_setting.anyone')}
                          {word === 'adminOnly' && t('security_setting.admin_only')}
                          {word === 'adminAndAuthor' && t('security_setting.admin_and_author')}
                        </a>
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </UncontrolledDropdown>
             );
           }}
            />
            <div className="form-text text-muted small">
              {t('security_setting.complete_deletion_explain')}
            </div>
          </div>
        </div>

        <h4>{t('security_setting.session')}</h4>
        <div className="form-group row">
          <label className="text-left text-md-right col-md-3 col-form-label">{t('security_setting.max_age')}</label>
          <div className="col-md-6">
            <input
              className="form-control col-md-3"
              name={sessionMaxAge}
              type="text"
              placeholder="2592000000"
              ref={register}
            />
            {/* eslint-disable-next-line react/no-danger */}
            <p className="form-text text-muted" dangerouslySetInnerHTML={{ __html: t('security_setting.max_age_desc') }} />
            <p className="card well">
              <span className="text-warning">
                <i className="icon-info"></i> {t('security_setting.max_age_caution')}
              </span>
            </p>
          </div>
        </div>

        <div className="row my-3">
          <div className="text-center text-md-left offset-md-3 col-md-5">
            <div className="row my-3">
              <div className="mx-auto">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={error != null}
                >{ t('Update') }
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
