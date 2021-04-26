import React from 'react';
import { useTranslation } from 'react-i18next';

const CustomBotWithProxyIntegrationCard = () => {

  const { t } = useTranslation();

  return (
    <>

      <div className="d-flex justify-content-center my-5 bot-integration">

        <div className="card rounded shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold mt-3 ml-4">Slack</h5>
          <div className="card-body p-4"></div>
        </div>

        <div className="text-center w-25 mb-5">
          <small
            className="text-secondary m-0"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_is_not_complete') }}
          />
          <div className="row m-0">
            <hr className="border-danger align-self-center admin-border col"></hr>
            <div className="circle text-center bg-primary border-light">
              <p className="text-light font-weight-bold m-0 pt-3">Proxy</p>
              <p className="text-light font-weight-bold">Server</p>
            </div>
            <hr className="border-danger align-self-center admin-border col"></hr>
          </div>
        </div>

        <div className="card rounded-lg shadow border-0 w-50 admin-bot-card">
          <div className="row m-0">
            <h5 className="card-title font-weight-bold mt-3 ml-4 col">GROWI App</h5>
            <div className="pull-right mt-3">
              <a className="icon-fw fa fa-repeat fa-2x"></a>
            </div>
          </div>
          <div className="card-body p-4 text-center">
            <a className="btn btn-primary mt-3">WESEEK Inner Wiki</a>
          </div>
        </div>

      </div>

    </>
  );
};

export default CustomBotWithProxyIntegrationCard;
