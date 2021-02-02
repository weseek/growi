import { FC, useEffect } from 'react';
import {
  Card, CardBody,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { useTranslation } from '~/i18n';

import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { useCustomizeSettingsSWR } from '~/stores/admin';
import { apiv3Put } from '~/utils/apiv3-client';

type FormValues = {
  themeType: string,
}

const isSavedStatesOfTabChangesInputName = 'isSavedStatesOfTabChanges';
const isEnabledAttachTitleHeaderInputName = 'isEnabledAttachTitleHeader';
const pageLimitationSInputName = 'pageLimitationS';
const pageLimitationMInputName = 'pageLimitationM';
const pageLimitationLInputName = 'pageLimitationL';
const pageLimitationXLInputName = 'pageLimitationXL';
const isEnabledStaleNotificationInputName = 'isEnabledStaleNotification';
const isAllReplyShownInputName = 'isAllReplyShown';

export const CustomizeFunctionSetting:FC = () => {
  const { t } = useTranslation();
  const { data, mutate } = useCustomizeSettingsSWR();

  const {
    register, handleSubmit, control, watch, setValue,
  } = useForm({
    defaultValues: {
      [isSavedStatesOfTabChangesInputName]: data?.[isSavedStatesOfTabChangesInputName],
      [isEnabledAttachTitleHeaderInputName]: data?.[isEnabledAttachTitleHeaderInputName],
      [pageLimitationSInputName]: data?.[pageLimitationSInputName],
      [pageLimitationMInputName]: data?.[pageLimitationMInputName],
      [pageLimitationLInputName]: data?.[pageLimitationLInputName],
      [pageLimitationXLInputName]: data?.[pageLimitationXLInputName],
      [isEnabledStaleNotificationInputName]: data?.[isEnabledStaleNotificationInputName],
      [isAllReplyShownInputName]: data?.[isAllReplyShownInputName],
    },
  });

  // watch for display dropdown label
  const selectedPageLimitationS = watch(pageLimitationSInputName);
  const selectedPageLimitationM = watch(pageLimitationMInputName);
  const selectedPageLimitationL = watch(pageLimitationLInputName);
  const selectedPageLimitationXL = watch(pageLimitationXLInputName);

  const submitHandler: SubmitHandler<FormValues> = async(formValues) => {

    try {
      await apiv3Put('/customize-setting/function', {
        [isSavedStatesOfTabChangesInputName]: formValues[isSavedStatesOfTabChangesInputName],
        [isEnabledAttachTitleHeaderInputName]: formValues[isEnabledAttachTitleHeaderInputName],
        [pageLimitationSInputName]: formValues[pageLimitationSInputName],
        [pageLimitationMInputName]: formValues[pageLimitationMInputName],
        [pageLimitationLInputName]: formValues[pageLimitationLInputName],
        [pageLimitationXLInputName]: formValues[pageLimitationXLInputName],
        [isEnabledStaleNotificationInputName]: formValues[isEnabledStaleNotificationInputName],
        [isAllReplyShownInputName]: formValues[isAllReplyShownInputName],
      });

      mutate();

      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.function') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    setValue(isSavedStatesOfTabChangesInputName, data?.[isSavedStatesOfTabChangesInputName]);
    setValue(isEnabledAttachTitleHeaderInputName, data?.[isEnabledAttachTitleHeaderInputName]);
    setValue(pageLimitationSInputName, data?.[pageLimitationSInputName]);
    setValue(pageLimitationMInputName, data?.[pageLimitationMInputName]);
    setValue(pageLimitationLInputName, data?.[pageLimitationLInputName]);
    setValue(pageLimitationXLInputName, data?.[pageLimitationXLInputName]);
    setValue(isEnabledStaleNotificationInputName, data?.[isEnabledStaleNotificationInputName]);
    setValue(isAllReplyShownInputName, data?.[isAllReplyShownInputName]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.themeType]);


  return (
    <div className="row">
      <form role="form" className="col-md-12" onSubmit={handleSubmit(submitHandler)}>
        <h2 className="admin-setting-header">{t('admin:customize_setting.function')}</h2>
        <Card className="card well my-3">
          <CardBody className="px-0 py-2">
            {t('admin:customize_setting.function_desc')}
          </CardBody>
        </Card>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="custom-control custom-checkbox custom-checkbox-success">
              <input
                name={isSavedStatesOfTabChangesInputName}
                className="custom-control-input"
                type="checkbox"
                id="isSavedStatesOfTabChanges"
                ref={register}
              />
              <label className="custom-control-label" htmlFor="isSavedStatesOfTabChanges">
                <strong>{t('admin:customize_setting.function_options.tab_switch')}</strong>
              </label>
              <p className="form-text text-muted">
                {t('admin:customize_setting.function_options.tab_switch_desc1')}
                <br />
                {t('admin:customize_setting.function_options.tab_switch_desc2')}
              </p>
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="custom-control custom-checkbox custom-checkbox-success">
              <input
                name={isEnabledAttachTitleHeaderInputName}
                className="custom-control-input"
                type="checkbox"
                id="isEnabledAttachTitleHeader"
                ref={register}
              />
              <label className="custom-control-label" htmlFor="isEnabledAttachTitleHeader">
                <strong>{t('admin:customize_setting.function_options.attach_title_header')}</strong>
              </label>
              <p className="form-text text-muted">
                {t('admin:customize_setting.function_options.attach_title_header_desc')}
              </p>
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="my-0 w-100">
              <label>{t('admin:customize_setting.function_options.list_num_s')}</label>
            </div>
            <Controller
              name={pageLimitationSInputName}
              control={control}
              render={({ onChange }) => {
                return (
                  <UncontrolledDropdown>
                    <DropdownToggle className="text-right col-6" caret>
                      <span className="float-left">{selectedPageLimitationS || 20}</span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu" role="menu">
                      {[10, 20, 50, 100].map((num) => {
                        return (
                          <DropdownItem key={num} role="presentation" onClick={() => onChange(num)}>
                            <a role="menuitem">{num}</a>
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                );
              }}
            />
            <p className="form-text text-muted">
              {t('admin:customize_setting.function_options.list_num_desc_s')}
            </p>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="my-0 w-100">
              <label>{t('admin:customize_setting.function_options.list_num_m')}</label>
            </div>
            <Controller
              name={pageLimitationMInputName}
              control={control}
              render={({ onChange }) => {
                return (
                  <UncontrolledDropdown>
                    <DropdownToggle className="text-right col-6" caret>
                      <span className="float-left">{selectedPageLimitationM || 10}</span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu" role="menu">
                      {[5, 10, 20, 50, 100].map((num) => {
                        return (
                          <DropdownItem key={num} role="presentation" onClick={() => onChange(num)}>
                            <a role="menuitem">{num}</a>
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                );
              }}
            />
            <p className="form-text text-muted">
              {t('admin:customize_setting.function_options.list_num_desc_m')}
            </p>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="my-0 w-100">
              <label>{t('admin:customize_setting.function_options.list_num_l')}</label>
            </div>
            <Controller
              name={pageLimitationLInputName}
              control={control}
              render={({ onChange }) => {
                return (
                  <UncontrolledDropdown>
                    <DropdownToggle className="text-right col-6" caret>
                      <span className="float-left">{selectedPageLimitationL || 50}</span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu" role="menu">
                      {[20, 50, 100, 200].map((num) => {
                        return (
                          <DropdownItem key={num} role="presentation" onClick={() => onChange(num)}>
                            <a role="menuitem">{num}</a>
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                );
              }}
            />
            <p className="form-text text-muted">
              {t('admin:customize_setting.function_options.list_num_desc_l')}
            </p>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="my-0 w-100">
              <label>{t('admin:customize_setting.function_options.list_num_xl')}</label>
            </div>
            <Controller
              name={pageLimitationXLInputName}
              control={control}
              render={({ onChange }) => {
                return (
                  <UncontrolledDropdown>
                    <DropdownToggle className="text-right col-6" caret>
                      <span className="float-left">{selectedPageLimitationXL || 20}</span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu" role="menu">
                      {[5, 10, 20, 50, 100].map((num) => {
                        return (
                          <DropdownItem key={num} role="presentation" onClick={() => onChange(num)}>
                            <a role="menuitem">{num}</a>
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                );
              }}
            />
            <p className="form-text text-muted">
              {t('admin:customize_setting.function_options.list_num_desc_xl')}
            </p>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="custom-control custom-checkbox custom-checkbox-success">
              <input
                name={isEnabledStaleNotificationInputName}
                className="custom-control-input"
                type="checkbox"
                id="isEnabledStaleNotification"
                ref={register}
              />
              <label className="custom-control-label" htmlFor="isEnabledStaleNotification">
                <strong>{t('admin:customize_setting.function_options.stale_notification')}</strong>
              </label>
              <p className="form-text text-muted">
                {t('admin:customize_setting.function_options.stale_notification_desc')}
              </p>
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="custom-control custom-checkbox custom-checkbox-success">
              <input
                name={isAllReplyShownInputName}
                className="custom-control-input"
                type="checkbox"
                id="isAllReplyShown"
                ref={register}
              />
              <label className="custom-control-label" htmlFor="isAllReplyShown">
                <strong>{t('admin:customize_setting.function_options.show_all_reply_comments')}</strong>
              </label>
              <p className="form-text text-muted">
                {t('admin:customize_setting.function_options.show_all_reply_comments_desc')}
              </p>
            </div>
          </div>
        </div>

        <div className="row my-3">
          <div className="mx-auto">
            <button type="submit" className="btn btn-primary">{ t('Update') }</button>
          </div>
        </div>
      </form>
    </div>
  );
};
