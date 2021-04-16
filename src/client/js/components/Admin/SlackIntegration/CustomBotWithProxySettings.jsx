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

        <div className="text-center w-50 row">

          {/* border */}
          <hr className="border-danger align-self-center admin-border col"></hr>

          {/* circle */}
          <div className="align-self-center col">
            <div className="circle-back">
              <div className="circle-front mt-3">
                <p className="text-light font-weight-bold m-0 pt-3 mt-2">Proxy</p>
                <p className="text-light font-weight-bold">Server</p>
              </div>
            </div>
          </div>

          {/* border */}
          <hr className="border-danger align-self-center admin-border col"></hr>

          {/* <p className="text-secondary m-0"><small>{t('admin:slack_integration.integration_sentence.integration_is_not_complete')}</small></p> */}
          {/* <p className="text-secondary"><small>{t('admin:slack_integration.integration_sentence.proceed_with_the_following_integration_procedure')}</small></p> */}
        </div>

        <div className="card rounded-lg shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold m-3">GROWI App</h5>
          <div className="card-body p-4 text-center">
            <a className="btn btn-primary mb-5">WESEEK Inner Wiki</a>
          </div>
        </div>
      </div>




      <div className="row text-center bot-integration">

        <hr className="border-danger align-self-center admin-border col"></hr>

        <div className="align-self-center col">
          <div className="circle-back">
            <div className="circle-front mt-3">
              <p className="text-light font-weight-bold m-0 pt-3 mt-2">Proxy</p>
              <p className="text-light font-weight-bold">Server</p>
            </div>
          </div>
        </div>

        <hr className="border-danger align-self-center admin-border col"></hr>
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
