import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const CustomizeLayoutSetting = (props) => {
  const { t } = props;

  const onClickSubmit = () => {};

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <h2 className="admin-setting-header">{t('admin:customize_setting.layout')}</h2>

          <div className="d-flex justify-content-around mt-5">
            <div className="card-deck">
              <div className="card">
                <img src="https://via.placeholder.com/350x150" />
                <div className="card-body text-center">
                  {t('admin:customize_setting.layout_options.default')}
                </div>
              </div>
              <div className="card">
                <img src="https://via.placeholder.com/350x150" />
                <div className="card-body  text-center">
                  {t('admin:customize_setting.layout_options.expanded')}
                </div>
              </div>
            </div>
          </div>

          <AdminUpdateButtonRow onClick={onClickSubmit} />
        </div>
      </div>
    </React.Fragment>
  );
};

CustomizeLayoutSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(CustomizeLayoutSetting);
