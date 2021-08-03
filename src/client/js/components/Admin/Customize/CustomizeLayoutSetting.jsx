import { useEffect, useState } from 'react';

import { useCustomizeSettingsSWR } from '~/stores/admin';
import { apiv3Put } from '~/utils/apiv3-client';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { isDarkMode } from '../../../util/color-scheme';
const colorText = isDarkMode ? 'dark' : 'light';

const CustomizeLayoutSetting = (props) => {
  const { t } = props;
  const { data, error, mutate } = useCustomizeSettingsSWR();
  const [isContainerFluid, setIsContainerFluid] = useState(false);

  useEffect(() => {
      setIsContainerFluid(data?.isContainerFluid)
  }, [data?.isContainerFluid]);

  const onClickSubmit = async() => {
    try {
      await apiv3Put('/customize-setting/layout', { isContainerFluid });
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.layout') }));
      mutate();
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <h2 className="admin-setting-header">{t('admin:customize_setting.layout')}</h2>

          <div className="d-flex justify-content-around mt-5">
            <div id="layoutOptions" className="card-deck">
              <div
                className={`card customize-layout-card ${!isContainerFluid ? 'border-active' : ''}`}
                onClick={() => setIsContainerFluid(false)}
                role="button"
              >
                <img src={`/images/customize-settings/default-${colorText}.svg`} />
                <div className="card-body text-center">
                  {t('admin:customize_setting.layout_options.default')}
                </div>
              </div>
              <div
                className={`card customize-layout-card ${isContainerFluid ? 'border-active' : ''}`}
                onClick={() => setIsContainerFluid(true)}
                role="button"
              >
                <img src={`/images/customize-settings/fluid-${colorText}.svg`} />
                <div className="card-body  text-center">
                  {t('admin:customize_setting.layout_options.expanded')}
                </div>
              </div>
            </div>
          </div>

          <div className="row my-3">
            <div className="mx-auto">
              <button type="button" className="btn btn-primary" onClick={onClickSubmit} disabled={error != null}>{ t('Update') }</button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CustomizeLayoutSetting
