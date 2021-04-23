import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const CustomBotIntegrationCard = (props) => {

  const { t } = useTranslation();

  return (
    <>

      <div className="d-flex justify-content-center my-5 bot-integration">
        <div className="card rounded shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold mt-3 ml-4">Slack</h5>
          <div className="card-body p-2 w-50 mx-auto">
            {props.slackWSNameInWithoutProxy && (
              <div className="card p-20 slack-work-space-name-card">
                <div className="m-2 text-center">
                  <h5 className="font-weight-bold">{ props.slackWSNameInWithoutProxy }</h5>
                  <img width={20} height={20} src="/images/slack-integration/growi-bot-kun-icon.png" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center w-25">
          {props.isSetupSlackBot && (
            <div className="mt-5">
              <p className="text-success"><small className="fa fa-check"> {t('admin:slack_integration.integration_sentence.integration_sucessed')}</small></p>
              <hr className="align-self-center admin-border-success border-success"></hr>
            </div>
          )}
          {!props.isSetupSlackBot && (
            <div className="mt-4">
              <small
                className="text-secondary m-0"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_is_not_complete') }}
              />
              <hr className="align-self-center admin-border-danger border-danger"></hr>
            </div>
          )}
        </div>

        <div className="card rounded-lg shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold mt-3 ml-4">GROWI App</h5>
          <div className="card-body p-4 mb-5 text-center">
            <div className="btn btn-primary">{ props.siteName }</div>
          </div>
        </div>
      </div>

  </>
  );
};

CustomBotIntegrationCard.PropTypes = {
  currentBotType: PropTypes.string,
  siteName: PropTypes.string,
  slackWSNameInWithoutProxy: PropTypes.string,
  isSetupSlackBot: PropTypes.bool
}

export default CustomBotIntegrationCard;
