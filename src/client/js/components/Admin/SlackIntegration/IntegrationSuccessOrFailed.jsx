import React from 'react';
import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';

const IntegrationSuccess = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="d-none d-lg-block">
        <p className="text-success small mt-5">
          <i className="fa fa-check mr-1" />
          {t('admin:slack_integration.integration_sentence.integration_successful')}
        </p>
        <hr className="align-self-center admin-border-success border-success"></hr>
      </div>
      <div id="integration-line-for-tooltip" className="d-block d-lg-none mt-5">
        <i className="fa fa-check mr-1 text-success" />
        <hr className="align-self-center admin-border-success border-success"></hr>
      </div>
      <UncontrolledTooltip placement="top" fade={false} target="integration-line-for-tooltip">
        <small>
          {t('admin:slack_integration.integration_sentence.integration_successful')}
        </small>
      </UncontrolledTooltip>
    </>
  );
};

const IntegrationFailed = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="d-none d-lg-block">
        <p className="mt-4">
          <small
            className="text-danger m-0"
          // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_is_not_complete') }}
          />
        </p>
        <hr className="align-self-center admin-border-danger border-danger"></hr>

      </div>
      <div id="integration-line-for-tooltip" className="d-block d-lg-none mt-5">
        <i className="icon-info text-danger" />
        <hr className="align-self-center admin-border-danger border-danger"></hr>
      </div>
      <UncontrolledTooltip placement="top" fade={false} target="integration-line-for-tooltip">
        <small
          className="m-0"
        // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_is_not_complete') }}
        />
      </UncontrolledTooltip>
    </>
  );
};

const SomeWorkSpaceNotIntegration = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="d-none d-lg-block">
        <p className="mt-4">
          <small
            className="text-danger m-0"
          // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_some_ws_is_not_complete') }}
          />
        </p>
        <hr className="align-self-center admin-border-danger border-danger"></hr>

      </div>
      <div id="integration-line-for-tooltip" className="d-block d-lg-none mt-5">
        <i className="icon-info text-danger" />
        <hr className="align-self-center admin-border-danger border-danger"></hr>
      </div>
      <UncontrolledTooltip placement="top" fade={false} target="integration-line-for-tooltip">
        <small
          className="m-0"
        // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.integration_sentence.integration_some_ws_is_not_complete') }}
        />
      </UncontrolledTooltip>
    </>
  );
};


const IntegrationSuccessOrFailed = (props) => {

  return (
    <>
      <IntegrationSuccess />
      <IntegrationFailed />
      <SomeWorkSpaceNotIntegration />
    </>
  );

};

export default IntegrationSuccessOrFailed;
