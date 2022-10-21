import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { useSWRxLayoutSetting } from '~/stores/admin/customize';
import { useNextThemes } from '~/stores/use-next-themes';

const CustomizeLayoutSetting = (): JSX.Element => {
  const { t } = useTranslation('admin');

  const { resolvedTheme } = useNextThemes();
  const { data: layoutSetting, mutate: mutateLayoutSetting } = useSWRxLayoutSetting();

  const [isContainerFluid, setIsContainerFluid] = useState<boolean>(layoutSetting?.isContainerFluid ?? false);
  const [retrieveError, setRetrieveError] = useState<any>();

  const onClickSubmit = async() => {
    try {
      await apiv3Put('/customize-setting/layout', { isContainerFluid });
      toastSuccess(t('toaster.update_successed', { target: t('customize_settings.layout'), ns: 'commons' }));
      mutateLayoutSetting();
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <h2 className="admin-setting-header">{t('customize_settings.layout')}</h2>

          <div className="d-flex justify-content-around mt-5">
            <div id="layoutOptions" className="card-deck">
              <div
                className={`card customize-layout-card ${!isContainerFluid ? 'border-active' : ''}`}
                onClick={() => setIsContainerFluid(false)}
                role="button"
              >
                <img src={`/images/customize-settings/default-${resolvedTheme}.svg`} />
                <div className="card-body text-center">
                  {t('customize_settings.layout_options.default')}
                </div>
              </div>
              <div
                className={`card customize-layout-card ${isContainerFluid ? 'border-active' : ''}`}
                onClick={() => setIsContainerFluid(true)}
                role="button"
              >
                <img src={`/images/customize-settings/fluid-${resolvedTheme}.svg`} />
                <div className="card-body  text-center">
                  {t('customize_settings.layout_options.expanded')}
                </div>
              </div>
            </div>
          </div>

          <div className="row my-3">
            <div className="mx-auto">
              <button type="button" className="btn btn-primary" onClick={onClickSubmit} disabled={retrieveError != null}>{ t('Update') }</button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CustomizeLayoutSetting;
