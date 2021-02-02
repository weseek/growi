import { useState, useEffect, FC } from 'react';
import {
  useForm, SubmitHandler, Validate, FormProvider,
} from 'react-hook-form';

import { useTranslation } from '~/i18n';
import { useCustomizeSettingsSWR } from '~/stores/admin';
import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { apiv3Put } from '~/utils/apiv3-client';

import { CustomizeThemeOptions } from '~/components/Admin/Customize/CustomizeThemeOptions';

type FormValues = {
  themeType: string,
}

const themeTypeInputName = 'themeType';


export const CustomizeThemeSetting:FC = () => {
  const { t } = useTranslation();
  const { data } = useCustomizeSettingsSWR();

  const themeTypeMethods = useForm({
    defaultValues: {
      [themeTypeInputName]: data?.themeType,
    },
  });

  const submitHandler: SubmitHandler<FormValues> = async(formValues) => {
    const themeType = formValues[themeTypeInputName];

    try {
      await apiv3Put('/customize-setting/theme', { themeType });
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.theme') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="row">
      <FormProvider {...themeTypeMethods}>
        <form role="form" className="col-md-12" onSubmit={themeTypeMethods.handleSubmit(submitHandler)}>
          <h2 className="admin-setting-header">{t('admin:customize_setting.theme')}</h2>
          {process.env.NODE_ENV === 'development' && (
          <div className="alert alert-warning">
            <strong>DEBUG MESSAGE:</strong> development build では、リアルタイムプレビューが無効になります
          </div>
        )}
          <CustomizeThemeOptions themeTypeInputName={themeTypeInputName} />
          <div className="row my-3">
            <div className="mx-auto">
              <button type="submit" className="btn btn-primary">{ t('Update') }</button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
