import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';

const ProxyCircle = () => (
  <div className="grw-bridge-proxy-circle">
    <div className="circle position-absolute bg-primary border-light rounded-circle">
      <p className="circle-inner text-light font-weight-bold d-none d-lg-inline">Proxy Server</p>
      <p className="circle-inner grw-proxy-server-name d-block d-lg-none">Proxy Server</p>
    </div>
  </div>
);

const BridgeCore = (props) => {
  const {
    description, iconClass, hrClass, withProxy,
  } = props;

  return (
    <>
      <div id="grw-bridge-container" className={`grw-bridge-container ${withProxy ? 'with-proxy' : ''}`}>
        <p className={`${withProxy ? 'mt-0' : 'mt-2'}`}>
          <i className={iconClass} />
          <small
            className="ms-2 d-none d-lg-inline"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </p>
        <div className="hr-container">
          { withProxy && <ProxyCircle /> }
          <hr className={`align-self-center ${hrClass}`} />
        </div>
      </div>
      <UncontrolledTooltip placement="top" fade={false} target="grw-bridge-container" className="d-block d-lg-none">
        <small
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </UncontrolledTooltip>
    </>
  );
};

BridgeCore.propTypes = {
  description: PropTypes.string.isRequired,
  iconClass: PropTypes.string.isRequired,
  hrClass: PropTypes.string.isRequired,
  withProxy: PropTypes.bool,
};


const Bridge = (props) => {
  const { t } = useTranslation();
  const { errorCount, totalCount, withProxy } = props;

  let description;
  let iconClass;
  let hrClass;

  // empty or all failed
  if (totalCount === 0 || errorCount === totalCount) {
    description = t('admin:slack_integration.integration_sentence.integration_is_not_complete');
    iconClass = 'icon-info text-danger';
    hrClass = 'border-danger admin-border-failed';
  }
  // all green
  else if (errorCount === 0) {
    description = t('admin:slack_integration.integration_sentence.integration_successful');
    iconClass = 'fa fa-check text-success';
    hrClass = 'border-success admin-border-success';
  }
  // some of them failed
  else {
    description = t('admin:slack_integration.integration_sentence.integration_some_ws_is_not_complete');
    iconClass = 'fa fa-check text-warning';
    hrClass = 'border-warning admin-border-failed';
  }

  return (
    <BridgeCore
      description={description}
      iconClass={iconClass}
      hrClass={hrClass}
      withProxy={withProxy}
    />
  );
};

Bridge.propTypes = {
  errorCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  withProxy: PropTypes.bool,
};

export default Bridge;
