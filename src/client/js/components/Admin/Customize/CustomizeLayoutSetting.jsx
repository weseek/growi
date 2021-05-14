import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../services/AppContainer';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import { toastSuccess, toastError } from '../../../util/apiNotification';

const CustomizeLayoutSetting = (props) => {
  const { t, appContainer } = props;

  const [isContainerFluid, setIsContainerFluid] = useState(false);

  useEffect(() => {
    const fetchData = async() => {
      const res = await appContainer.apiv3Get('/customize-setting/layout');
      setIsContainerFluid(res.data.isContainerFluid);
    };
    fetchData();
  }, []);

  const onClickSubmit = async() => {
    try {
      await appContainer.apiv3Put('/customize-setting/layout', { isContainerFluid });
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.layout') }));
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
            <div className="card-deck">
              <div className={`card ${isContainerFluid ? 'border border-info' : ''}`} onClick={() => setIsContainerFluid(true)} role="button">
                <img src="https://via.placeholder.com/350x150" />
                <div className="card-body text-center">
                  {t('admin:customize_setting.layout_options.default')}
                </div>
              </div>
              <div className={`card ${!isContainerFluid ? 'border border-info' : ''}`} onClick={() => setIsContainerFluid(false)} role="button">
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

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(CustomizeLayoutSetting);
