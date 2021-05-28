import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';

import ConductionStatusHr from './ConductionStatusHr';

const IntegrationSuccess = (props) => {
  const { t } = useTranslation();
  const { conductionStatus } = props;

  return (
    <>
      <div className="d-none d-lg-block">
        <p className="text-success small mt-5">
          <i className="fa fa-check mr-1" />
          {t('admin:slack_integration.integration_sentence.integration_successful')}
        </p>
        <ConductionStatusHr conductionStatus={conductionStatus} />
      </div>
      <div id="integration-line-for-tooltip" className="d-block d-lg-none mt-5">
        <i className="fa fa-check mr-1 text-success" />
        <ConductionStatusHr conductionStatus={conductionStatus} />
      </div>
      <UncontrolledTooltip placement="top" fade={false} target="integration-line-for-tooltip">
        <small>
          {t('admin:slack_integration.integration_sentence.integration_successful')}
        </small>
      </UncontrolledTooltip>
    </>
  );
};

const IntegrationFailed = (props) => {
  const { t } = useTranslation();
  const { conductionStatus } = props;

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
        <ConductionStatusHr conductionStatus={conductionStatus} />

      </div>
      <div id="integration-line-for-tooltip" className="d-block d-lg-none mt-5">
        <i className="icon-info text-danger" />
        <ConductionStatusHr conductionStatus={conductionStatus} />
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

const SomeWorkSpaceNotIntegration = (props) => {
  const { t } = useTranslation();
  const { conductionStatus } = props;

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
        <ConductionStatusHr conductionStatus={conductionStatus} />
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
  const { conductionStatus } = props;

  return (
    <>
      {conductionStatus === 'green' && <IntegrationSuccess />}
      {conductionStatus === 'red' && <IntegrationFailed />}
      {conductionStatus === 'yellow' && <SomeWorkSpaceNotIntegration />}
    </>
  );
};

IntegrationSuccessOrFailed.propTypes = {
  conductionStatus: PropTypes.string.isRequired,
};
export default IntegrationSuccessOrFailed;
