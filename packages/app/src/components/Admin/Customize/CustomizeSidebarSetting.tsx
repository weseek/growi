import React from 'react';

import { useTranslation } from 'react-i18next';
import { Card, CardBody } from 'reactstrap';

const CustomizeSidebarsetting = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">

          <h2 className="admin-setting-header">{t('admin:customize_setting.default_sidebar_mode')}</h2>

          <Card className="card well my-3">
            <CardBody className="px-0 py-2">
              ページを訪れたゲストのサイドバーモードを設定できます
            </CardBody>
          </Card>

          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="drawerRadioButton"
            />
            <label className="form-check-label" htmlFor="drawerRadioButton">
              Drawer Mode
            </label>
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="dockRadioButton"
            />
            <label className="form-check-label" htmlFor="dockRadioButton">
              Dock Mode
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
