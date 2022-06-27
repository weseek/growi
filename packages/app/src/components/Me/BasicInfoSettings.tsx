import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { localeMetadatas } from '~/client/util/i18n';
import { useSWRxPersonalSettings, usePersonalSettings } from '~/stores/personal-settings';

import { withUnstatedContainers } from '../UnstatedUtils';

type Props = {
  appContainer: AppContainer,
}

const BasicInfoSettings = (props: Props) => {
  const { t } = useTranslation();
  const { appContainer } = props;

  const {
    data: personalSettingsDataFromDB,
    mutate: mutateDatabaseData,
  } = useSWRxPersonalSettings();
  const {
    data: personalSettingsInfo, mutate, sync, updateBasicInfo, error,
  } = usePersonalSettings();

  useEffect(() => {
    sync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalSettingsDataFromDB]);

  const submitHandler = async() => {

    try {
      updateBasicInfo();
      // revaridate
      mutateDatabaseData();
      sync();
      toastSuccess(t('toaster.update_successed', { target: t('Basic Info') }));
    }
    catch (err) {
      toastError(err);
    }
  };


  const { registrationWhiteList } = appContainer.getConfig();

  const changePersonalSettingsHandler = (updateData) => {
    if (personalSettingsInfo == null) {
      return;
    }
    mutate({ ...personalSettingsInfo, ...updateData });
  };


  return (
    <>

      <div className="form-group row">
        <label htmlFor="userForm[name]" className="text-left text-md-right col-md-3 col-form-label">{t('Name')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            name="userForm[name]"
            defaultValue={personalSettingsInfo?.name || ''}
            onChange={e => changePersonalSettingsHandler({ name: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group row">
        <label htmlFor="userForm[email]" className="text-left text-md-right col-md-3 col-form-label">{t('Email')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            name="userForm[email]"
            defaultValue={personalSettingsInfo?.email || ''}
            onChange={e => changePersonalSettingsHandler({ email: e.target.value })}
          />
          {registrationWhiteList.length !== 0 && (
            <div className="form-text text-muted">
              {t('page_register.form_help.email')}
              <ul>
                {registrationWhiteList.map(data => <li key={data}><code>{data}</code></li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">{t('Disclose E-mail')}</label>
        <div className="col-md-6">
          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              id="radioEmailShow"
              className="custom-control-input"
              name="userForm[isEmailPublished]"
              checked={personalSettingsInfo?.isEmailPublished || true}
              onChange={() => changePersonalSettingsHandler({ isEmailPublished: true })}
            />
            <label className="custom-control-label" htmlFor="radioEmailShow">{t('Show')}</label>
          </div>
          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              id="radioEmailHide"
              className="custom-control-input"
              name="userForm[isEmailPublished]"
              checked={!personalSettingsInfo?.isEmailPublished || false}
              onChange={() => changePersonalSettingsHandler({ isEmailPublished: false })}
            />
            <label className="custom-control-label" htmlFor="radioEmailHide">{t('Hide')}</label>
          </div>
        </div>
      </div>

      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">{t('Language')}</label>
        <div className="col-md-6">
          {
            localeMetadatas.map(meta => (
              <div key={meta.id} className="custom-control custom-radio custom-control-inline">
                <input
                  type="radio"
                  id={`radioLang${meta.id}`}
                  className="custom-control-input"
                  name="userForm[lang]"
                  checked={personalSettingsInfo?.lang === meta.id}
                  onChange={() => changePersonalSettingsHandler({ lang: meta.id })}
                />
                <label className="custom-control-label" htmlFor={`radioLang${meta.id}`}>{meta.displayName}</label>
              </div>
            ))
          }
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="userForm[slackMemberId]" className="text-left text-md-right col-md-3 col-form-label">{t('Slack Member ID')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            key="slackMemberId"
            name="userForm[slackMemberId]"
            defaultValue={personalSettingsInfo?.slackMemberId || ''}
            onChange={e => changePersonalSettingsHandler({ slackMemberId: e.target.value })}
          />
        </div>
      </div>

      <div className="row my-3">
        <div className="offset-4 col-5">
          <button
            data-testid="grw-besic-info-settings-update-button"
            type="button"
            className="btn btn-primary"
            onClick={submitHandler}
            disabled={error != null}
          >
            {t('Update')}
          </button>
        </div>
      </div>

    </>
  );
};


/**
 * Wrapper component for using unstated
 */
const BasicInfoSettingsWrapper = withUnstatedContainers(BasicInfoSettings, [AppContainer]);

export default BasicInfoSettingsWrapper;
