import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

const CustomBotWithProxySettings = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { appContainer, adminAppContainer } = props;
  const { t } = useTranslation();

  return (
    <>

      {/* --------------- start ---------------*/}

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_with_proxy_integration')}</h2>

      <div className="d-flex justify-content-center my-5 bot-integration">
        <div className="card rounded shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold m-3">Slack</h5>
          <div className="card-body p-4"></div>
        </div>

        <div className="text-center align-items-center justify-content-center">

          <div>
            <div className="circle-back p-1"></div>
            <div className="circle-front">
              <p className="text-light">Proxy</p>
              <p className="text-light">Server</p>
            </div>
          </div>
          {/* <p className="text-secondary m-0"><small>{t('admin:slack_integration.integration_sentence.integration_is_not_complete')}</small></p>
          <p className="text-secondary"><small>{t('admin:slack_integration.integration_sentence.proceed_with_the_following_integration_procedure')}</small></p>
          <hr className="border-danger align-self-center admin-border"></hr> */}
        </div>

        <div className="card rounded-lg shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold m-3">GROWI App</h5>
          <div className="card-body p-4 text-center">
            <a className="btn btn-primary mb-5">WESEEK Inner Wiki</a>
          </div>
        </div>
      </div>

      {/* ---------------  end  ---------------*/}

    </>
  );
};


const CustomBotWithProxySettingsWrapper = withUnstatedContainers(CustomBotWithProxySettings, [AppContainer, AdminAppContainer]);

CustomBotWithProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default CustomBotWithProxySettingsWrapper;
