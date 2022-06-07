import React from 'react';

import { useTranslation } from 'react-i18next';
import { Card, CardBody } from 'reactstrap';

import SidebarDockIcon from '../../Icons/SidebarDockIcon';
import SidebarDrawerIcon from '../../Icons/SidebarDrawerIcon';

const CustomizeSidebarsetting = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">

          <h2 className="admin-setting-header">{t('admin:customize_setting.default_sidebar_mode')}</h2>

          <Card className="card well my-3">
            <CardBody className="px-0 py-2">
              {t('admin:customize_setting.default_sidebar_mode_desc')}
            </CardBody>
          </Card>

          <div className="custom-control custom-radio my-3">
            <input
              type="radio"
              id="drawerRadioButton"
              className="custom-control-input mr-1"
            />
            <label className="custom-control-label d-flex align-items-center admin-customize-sidebar-icon" htmlFor="drawerRadioButton">
              <SidebarDrawerIcon />
              <div className="ml-2">Drawer Mode</div>
            </label>
          </div>

          <div className="custom-control custom-radio">
            <input
              type="radio"
              id="dockRadioButton"
              className="custom-control-input mr-1"
            />
            <label className="custom-control-label d-flex align-items-center admin-customize-sidebar-icon" htmlFor="dockRadioButton">
              <SidebarDockIcon />
              <div className="ml-2">Dock Mode</div>
            </label>
          </div>

          <div className="row my-3">
            <div className="mx-auto">
              <button type="button" className="btn btn-primary">{ t('Update') }</button>
            </div>
          </div>

        </div>
      </div>
    </React.Fragment>
  );
};

export default CustomizeSidebarsetting;
