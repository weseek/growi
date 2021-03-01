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


const retrieveError = null;
const restrictGuestMode = 'restrictGuestMode';
const pageCompleteDeletionAuthority = 'pageCompleteDeletionAuthority';
const hideRestrictedByOwner = 'hideRestrictedByOwner';
const hideRestrictedByGroup = 'hideRestrictedByGroup';
const wikiMode = '';
const isWikiModeForced = true;

type FormValues ={
[restrictGuestMode]: string,
[pageCompleteDeletionAuthority]: string,
[hideRestrictedByOwner]: string,
[hideRestrictedByGroup]: string,
[wikiMode]: string,
};

export const SecuritySetting: FC<FormValues> = () => {
  const { t } = useTranslation();
  const { data } = useSecuritySettingGeneralSWR();
  const {
    register, control, handleSubmit, setValue, watch,
  } = useForm({
    defaultValues: {
      [restrictGuestMode]: data?.[restrictGuestMode],
      [pageCompleteDeletionAuthority]: data?.[pageCompleteDeletionAuthority],
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
    setValue(restrictGuestMode, data?.[restrictGuestMode]);
    setValue(pageCompleteDeletionAuthority, data?.[pageCompleteDeletionAuthority]);
    setValue(hideRestrictedByOwner, data?.[hideRestrictedByOwner]);
    setValue(hideRestrictedByGroup, data?.[hideRestrictedByGroup]);
    setValue(wikiMode, data?.[wikiMode]);
  }, [
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
        {/* temporarily set null */}
        {retrieveError != null && (
        <div className="alert alert-danger">
          <p>{t('Error occurred')} : {retrieveError}</p>
        </div>
        )}

        <h4 className="mt-4">
          { t('page_list_and_search_results') }
        </h4>
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
                    type="checkbox"
                    className="custom-control-input"
                    id="isShowRestrictedByOwner"
                    ref={register}
                  />
                  <label className="custom-control-label" htmlFor="isShowRestrictedByOwner">
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
                    type="checkbox"
                    className="custom-control-input"
                    id="isShowRestrictedByGroup"
                    ref={register}
                  />
                  <label className="custom-control-label" htmlFor="isShowRestrictedByGroup">
                    {t('displayed_or_hidden')}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <h4>{t('page_access_and_delete_rights')}</h4>
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
                      className={`text-right btn-outline-secondary col-12 col-md-auto ${isWikiModeForced} && 'disabled`}
                      color="transparent"
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
            {isWikiModeForced && (
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
                <DropdownToggle className="text-right btn-outline-secondary col-12 col-md-auto" color="transparent" caret>
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
        <div className="row my-3">
          <div className="text-center text-md-left offset-md-3 col-md-5">
            <div className="row my-3">
              <div className="mx-auto">
                <button type="submit" className="btn btn-primary">{ t('Update') }</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SecuritySetting;

// class DepricatedSecuritySetting extends React.Component {

// constructor(props) {
//   super(props);

//   this.putSecuritySetting = this.putSecuritySetting.bind(this);
// }

// async putSecuritySetting() {
//   const { t, adminGeneralSecurityContainer } = this.props;
//   try {
//     await adminGeneralSecurityContainer.updateGeneralSecuritySetting();
//     toastSuccess(t('security_setting.updated_general_security_setting'));
//   }
//   catch (err) {
//     toastError(err);
//   }
// }

// render() {
//   const { t, adminGeneralSecurityContainer } = this.props;
//   const { currentRestrictGuestMode, currentPageCompleteDeletionAuthority } = adminGeneralSecurityContainer.state;

//   return (
//     <React.Fragment>
//       <h2 className="alert-anchor border-bottom">
//         {t('security_settings')}
//       </h2>
//       {adminGeneralSecurityContainer.retrieveError != null && (
//       <div className="alert alert-danger">
//         <p>{t('Error occurred')} : {adminGeneralSecurityContainer.retrieveError}</p>
//       </div>
//         )}

//       <h4 className="mt-4">
//         { t('page_list_and_search_results') }
//       </h4>
//       <table className="table table-bordered col-lg-9 mb-5">
//         <thead>
//           <tr>
//             <th scope="col">{ t('scope_of_page_disclosure') }</th>
//             <th scope="col">{ t('set_point') }</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <th scope="row">{ t('Public') }</th>
//             <td>{ t('always_displayed') }</td>
//           </tr>
//           <tr>
//             <th scope="row">{ t('Anyone with the link') }</th>
//             <td>{ t('always_hidden') }</td>
//           </tr>
//           <tr>
//             <th scope="row">{ t('Only me') }</th>
//             <td>
//               <div className="custom-control custom-switch custom-checkbox-success">
//                 <input
//                   type="checkbox"
//                   className="custom-control-input"
//                   id="isShowRestrictedByOwner"
//                   checked={adminGeneralSecurityContainer.state.isShowRestrictedByOwner}
//                   onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByOwner() }}
//                 />
//                 <label className="custom-control-label" htmlFor="isShowRestrictedByOwner">
//                   {t('displayed_or_hidden')}
//                 </label>
//               </div>
//             </td>
//           </tr>
//           <tr>
//             <th scope="row">{ t('Only inside the group') }</th>
//             <td>
//               <div className="custom-control custom-switch custom-checkbox-success">
//                 <input
//                   type="checkbox"
//                   className="custom-control-input"
//                   id="isShowRestrictedByGroup"
//                   checked={adminGeneralSecurityContainer.state.isShowRestrictedByGroup}
//                   onChange={() => { adminGeneralSecurityContainer.switchIsShowRestrictedByGroup() }}
//                 />
//                 <label className="custom-control-label" htmlFor="isShowRestrictedByGroup">
//                   {t('displayed_or_hidden')}
//                 </label>
//               </div>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//       <h4>{t('page_access_and_delete_rights')}</h4>
//       <div className="row mb-4">
//         <div className="col-md-3 text-md-right py-2">
//           <strong>{t('security_setting.Guest Users Access')}</strong>
//         </div>
//         <div className="col-md-9">
//           <div className="dropdown">
//             {/* TODO: show dropdown text byGW-5142 */}
//             <button
//               className={`btn btn-outline-secondary dropdown-toggle text-right col-12
//                           col-md-auto ${adminGeneralSecurityContainer.isWikiModeForced && 'disabled'}`}
//               type="button"
//               id="dropdownMenuButton"
//               data-toggle="dropdown"
//               aria-haspopup="true"
//               aria-expanded="true"
//             >
//               <span className="float-left">
//                 {currentRestrictGuestMode === 'Deny' && t('security_setting.guest_mode.deny')}
//                 {currentRestrictGuestMode === 'Readonly' && t('security_setting.guest_mode.readonly')}
//               </span>
//             </button>
//             <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
//               <button className="dropdown-item" type="button" onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Deny') }}>
//                 {t('security_setting.guest_mode.deny')}
//               </button>
//               <button className="dropdown-item" type="button" onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Readonly') }}>
//                 {t('security_setting.guest_mode.readonly')}
//               </button>
//             </div>
//           </div>
//           {adminGeneralSecurityContainer.isWikiModeForced && (
//             <p className="alert alert-warning mt-2 text-left offset-3 col-6">
//               <i className="icon-exclamation icon-fw">
//               </i><b>FIXED</b><br />
//               <b
//                 dangerouslySetInnerHTML={{
//                   __html: t('security_setting.Fixed by env var',
//                     { forcewikimode: 'FORCE_WIKI_MODE', wikimode: adminGeneralSecurityContainer.state.wikiMode }),
//                 }}
//               />
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="row mb-4">
//         <div className="col-md-3 text-md-right mb-2">
//           <strong>{t('security_setting.complete_deletion')}</strong>
//         </div>
//         <div className="col-md-6">
//           <div className="dropdown">
//             <button
//               className="btn btn-outline-secondary dropdown-toggle text-right col-12 col-md-auto"
//               type="button"
//               id="dropdownMenuButton"
//               data-toggle="dropdown"
//               aria-haspopup="true"
//               aria-expanded="true"
//             >
//               <span className="float-left">
//                 {currentPageCompleteDeletionAuthority === 'anyOne' && t('security_setting.anyone')}
//                 {currentPageCompleteDeletionAuthority === 'adminOnly' && t('security_setting.admin_only')}
//                 {(currentPageCompleteDeletionAuthority === 'adminAndAuthor' || currentPageCompleteDeletionAuthority == null)
//                     && t('security_setting.admin_and_author')}
//               </span>
//             </button>
//             <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
//               <button
//                 className="dropdown-item" type="button" onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('anyOne') }}>
//                 {t('security_setting.anyone')}
//               </button>
//               <button
//                 className="dropdown-item"
//                 type="button"
//                 onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('adminOnly') }}
//               >
//                 {t('security_setting.admin_only')}
//               </button>
//               <button
//                 className="dropdown-item"
//                 type="button"
//                 onClick={() => { adminGeneralSecurityContainer.changePageCompleteDeletionAuthority('adminAndAuthor') }}
//               >
//                 {t('security_setting.admin_and_author')}
//               </button>
//             </div>
//             <p className="form-text text-muted small">
//               {t('security_setting.complete_deletion_explain')}
//             </p>
//           </div>
//         </div>
//       </div>
//       <div className="row my-3">
//         <div className="text-center text-md-left offset-md-3 col-md-5">
//           <button type="button" className="btn btn-primary" disabled={adminGeneralSecurityContainer.retrieveError != null} onClick={this.putSecuritySetting}>
//             {t('Update')}
//           </button>
//         </div>
//       </div>
//     </React.Fragment>
//   );
//   }

// }

// SecuritySetting.propTypes = {
//   t: PropTypes.func.isRequired, // i18next
//   csrf: PropTypes.string,
//   adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
// };

// const SecuritySettingWrapper = withUnstatedContainers(SecuritySetting, [AdminGeneralSecurityContainer]);

// export default withTranslation()(SecuritySettingWrapper);
