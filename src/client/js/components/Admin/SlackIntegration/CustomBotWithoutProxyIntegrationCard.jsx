import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';

const CustomBotWithoutProxyIntegrationCard = (props) => {

  const { t } = useTranslation();

  return (
    <div className="d-flex justify-content-center my-5 bot-integration">
      <div className="card rounded shadow border-0 w-50 admin-bot-card mb-0">
        <h5 className="card-title font-weight-bold mt-3 ml-4">Slack</h5>
        <div className="card-body p-2 w-50 mx-auto">
          {props.slackWSNameInWithoutProxy != null && (
            <div className="card slack-work-space-name-card">
              <div className="m-2 text-center">
                <h5 className="font-weight-bold">{props.slackWSNameInWithoutProxy}</h5>
                <img width={20} height={20} src="/images/slack-integration/growi-bot-kun-icon.png" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center w-25">

        <div className="d-none d-lg-block">

          {/* <p className="text-success small mt-5">
            <i className="fa fa-check mr-1" />
            {t('admin:slack_integration.integration_sentence.integration_successful')}
          </p> */}

          <p className="mt-4">
            <small
              className="text-warning m-0"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_is_not_complete') }}
            />
          </p>
        </div>

        <div id="integration-line-for-tooltip" className="d-block d-lg-none mt-5">
          {/* <i className="fa fa-check mr-1 text-success" /> */}
          <i className="icon-info text-danger" />
        </div>

        {/* <hr className="align-self-center admin-border-success border-success"></hr> */}
        <hr className="align-self-center admin-border-danger border-danger"></hr>
      </div>

      <div className="card rounded-lg shadow border-0 w-50 admin-bot-card mb-0">
        <h5 className="card-title font-weight-bold mt-3 ml-4">GROWI App</h5>
        <div className="card-body p-4 mb-5 text-center">
          <div className="btn btn-primary">{ props.siteName }</div>
        </div>
      </div>

      <UncontrolledTooltip placement="top" fade={false} target="integration-line-for-tooltip">
        {/* <small>
          {t('admin:slack_integration.integration_sentence.integration_successful')}
        </small> */}

        <small
          className="m-0"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_is_not_complete') }}
        />
      </UncontrolledTooltip>
    </div>
  );
};

CustomBotWithoutProxyIntegrationCard.propTypes = {
  siteName: PropTypes.string.isRequired,
  slackWSNameInWithoutProxy: PropTypes.string,
};

export default CustomBotWithoutProxyIntegrationCard;
