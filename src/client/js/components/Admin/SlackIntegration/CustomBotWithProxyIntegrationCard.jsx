import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';

const CustomBotWithProxyIntegrationCard = (props) => {
  const { t } = useTranslation();

  return (
    <div className="d-flex justify-content-center my-5 bot-integration">

      <div className="card rounded shadow border-0 w-50 admin-bot-card">
        <h5 className="card-title font-weight-bold mt-3 ml-4">Slack</h5>
        <div className="card-body px-5">
          {props.slackWorkSpaces.map((slackWorkSpaceName) => {
            return (
              <div key={slackWorkSpaceName.name} className={slackWorkSpaceName.active ? 'card slack-work-space-name-card' : ''}>
                <div className="m-2 text-center">
                  <h5 className="font-weight-bold">{slackWorkSpaceName.name}</h5>
                  <img width={20} height={20} src="/images/slack-integration/growi-bot-kun-icon.png" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center w-25 mt-5">

        <div className="d-none d-lg-block mb-5">
          {props.isSlackScopeSet && (
            <p className="text-success small">
              <i className="fa fa-check mr-1" />
              {t('admin:slack_integration.integration_sentence.integration_successful')}
            </p>
          )}
          {!props.isSlackScopeSet && (
            <small
              className="text-secondary"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_is_not_complete') }}
            />
          )}
        </div>

        <div className="d-block d-lg-none mb-2">
          {props.isSlackScopeSet && (
            <i className="fa fa-check mr-1 text-success" />
          )}
          {!props.isSlackScopeSet && (
            <i className="icon-info text-danger" />
          )}
        </div>

        <div className="pt-2">
          <div className="position-relative">

            <div className="circle-default position-absolute bg-primary border-light d-none d-lg-block">
              <p className="circle-inner text-light font-weight-bold">Proxy Server</p>
            </div>

            <div id="integration-circle-for-tooltip" className="circle-mini position-absolute bg-primary border-light d-block d-lg-none p pb-2" />

            {props.isSlackScopeSet && (
              <hr className="align-self-center border-success admin-border-success"></hr>
            )}
            {!props.isSlackScopeSet && (
              <hr className="align-self-center border-danger admin-border-danger"></hr>
            )}
          </div>
        </div>
      </div>

      <div className="card rounded-lg shadow border-0 w-50 admin-bot-card">
        <div className="row">
          <h5 className="card-title font-weight-bold mt-3 ml-4 col">GROWI App</h5>
          <div className="pull-right mt-3 mr-3">
            <a className="icon-fw fa fa-repeat fa-2x"></a>
          </div>
        </div>
        <div className="card-body text-center">
          <div className="mt-5 border p-2 mx-3 bg-primary text-light">
            {props.siteName}
          </div>
        </div>
      </div>

      <UncontrolledTooltip placement="top" fade={false} target="integration-circle-for-tooltip">
        {props.isSlackScopeSet && (
          <>
            {t('admin:slack_integration.integration_sentence.integration_successful')}
          </>
        )}
        {!props.isSlackScopeSet && (
          <small
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_is_not_complete') }}
          />
        )}
      </UncontrolledTooltip>
    </div>
  );
};

CustomBotWithProxyIntegrationCard.propTypes = {
  siteName: PropTypes.string.isRequired,
  slackWorkSpaces: PropTypes.array,
  isSlackScopeSet: PropTypes.bool,
};

export default CustomBotWithProxyIntegrationCard;
