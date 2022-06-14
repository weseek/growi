import React, { useState, useCallback, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { Card, CardBody } from 'reactstrap';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { isDarkMode as isDarkModeByUtil } from '~/client/util/color-scheme';

const CustomizeSidebarsetting = (): JSX.Element => {
  const { t } = useTranslation();
  const [isSidebarDrawerMode, setIsSidebarDrawerMode] = useState(false);
  const [isSidebarClosedAtDockMode, setIsSidebarClosedAtDockMode] = useState(false);
  const [retrieveError, setRetrieveError] = useState();

  const isDarkMode = isDarkModeByUtil();
  const colorText = isDarkMode ? 'dark' : 'light';
  const drawerIconFileName = `/images/customize-settings/drawer-${colorText}.svg`;
  const dockIconFileName = `/images/customize-settings/dock-${colorText}.svg`;

  const retrieveData = useCallback(async() => {
    try {
      const resSidebar = await apiv3Get('/customize-setting/sidebar');
      setIsSidebarDrawerMode(resSidebar.data.isSidebarDrawerMode);

      const resIsClosed = await apiv3Get('/customize-setting/isSidebarClosedAtDockMode');
      setIsSidebarClosedAtDockMode(resIsClosed.data.isSidebarClosedAtDockMode);
    }
    catch (err) {
      setRetrieveError(err);
      toastError(err);
    }
  }, []);

  const onClickSubmit = async() => {
    try {
      await apiv3Put('/customize-setting/sidebar', { isSidebarDrawerMode });
      await apiv3Put('/customize-setting/isSidebarClosedAtDockMode', { isSidebarClosedAtDockMode });

      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.default_sidebar_mode.title') }));
      retrieveData();
    }
    catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    retrieveData();
  }, [retrieveData]);

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">

          <h2 className="admin-setting-header">{t('admin:customize_setting.default_sidebar_mode.title')}</h2>

          <Card className="card well my-3">
            <CardBody className="px-0 py-2">
              {t('admin:customize_setting.default_sidebar_mode.desc')}
            </CardBody>
          </Card>

          <div className="d-flex justify-content-around mt-5">
            <div id="layoutOptions" className="card-deck">
              <div
                className={`card customize-layout-card ${isSidebarDrawerMode ? 'border-active' : ''}`}
                onClick={() => setIsSidebarDrawerMode(true)}
                role="button"
              >
                <img src={drawerIconFileName} />
                <div className="card-body text-center">
                  Drawer Mode
                </div>
              </div>
              <div
                className={`card customize-layout-card ${!isSidebarDrawerMode ? 'border-active' : ''}`}
                onClick={() => setIsSidebarDrawerMode(false)}
                role="button"
              >
                <img src={dockIconFileName} />
                <div className="card-body  text-center">
                  Dock Mode
                </div>
              </div>
            </div>
          </div>

          <Card className="card well my-5">
            <CardBody className="px-0 py-2">
              {t('admin:customize_setting.default_sidebar_mode.dock_mode_default_desc')}
            </CardBody>
          </Card>

          <div className="px-3">
            <div className="custom-control custom-radio my-3">
              <input
                type="radio"
                id="is-open"
                className="custom-control-input"
                name="mailVisibility"
                checked={!isSidebarDrawerMode && !isSidebarClosedAtDockMode}
                disabled={isSidebarDrawerMode}
                onChange={() => setIsSidebarClosedAtDockMode(false)}
              />
              <label className="custom-control-label" htmlFor="is-open">
                {t('admin:customize_setting.default_sidebar_mode.dock_mode_default_open')}
              </label>
            </div>
            <div className="custom-control custom-radio my-3">
              <input
                type="radio"
                id="is-closed"
                className="custom-control-input"
                name="mailVisibility"
                checked={!isSidebarDrawerMode && isSidebarClosedAtDockMode}
                disabled={isSidebarDrawerMode}
                onChange={() => setIsSidebarClosedAtDockMode(true)}
              />
              <label className="custom-control-label" htmlFor="is-closed">
                {t('admin:customize_setting.default_sidebar_mode.dock_mode_default_close')}
              </label>
            </div>
          </div>

          <div className="row my-3">
            <div className="mx-auto">
              <button type="button" onClick={onClickSubmit} className="btn btn-primary" disabled={retrieveError != null}>{ t('Update') }</button>
            </div>
          </div>

        </div>
      </div>
    </React.Fragment>
  );
};

export default CustomizeSidebarsetting;
