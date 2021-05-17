import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../../util/apiNotification';
import { isDarkMode as isDarkModeByUtil } from '../../../util/color-scheme';

const isDarkMode = isDarkModeByUtil();
const colorText = isDarkMode ? 'dark' : 'light';

const CustomizeLayoutSetting = (props) => {
  const { t } = props;

  const [isContainerFluid, setIsContainerFluid] = useState(false);
  const [retrieveError, setRetrieveError] = useState();

  const retrieveData = useCallback(async() => {
    try {
      // const res = await appContainer.apiv3Get('/customize-setting/layout');
      // setIsContainerFluid(res.data.isContainerFluid);
    }
    catch (err) {
      setRetrieveError(err);
      toastError(err);
    }
  }, []);

  useEffect(() => {
    retrieveData();
  }, [retrieveData]);

  const onClickSubmit = async() => {
    try {
      // await appContainer.apiv3Put('/customize-setting/layout', { isContainerFluid });
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.layout') }));
      retrieveData();
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
              <button type="button" className="btn btn-primary" onClick={onClickSubmit} disabled={retrieveError != null}>{ t('Update') }</button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

CustomizeLayoutSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(CustomizeLayoutSetting);
