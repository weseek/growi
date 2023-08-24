import React from 'react';
import PropTypes from 'prop-types';
import Bridge from './Bridge';

const CustomBotWithoutProxyConnectionStatus = (props) => {
  const { siteName, connectionStatuses } = props;

  const connectionStatusValues = Object.values(connectionStatuses); // type: ConnectionStatus[]

  const totalCount = connectionStatusValues.length;
  const errorCount = connectionStatusValues.filter(connectionStatus => connectionStatus.error != null).length;

  let workspaceName;
  if (totalCount > 0) {
    workspaceName = connectionStatusValues[0].workspaceName;
  }

  return (
    <div className="d-flex justify-content-center my-5 bot-integration">
      <div className="card rounded shadow border-0 w-50 admin-bot-card mb-0">
        <h5 className="card-title fw-bold mt-3 ms-4">Slack</h5>
        <div className="card-body px-4 text-center mx-md-5">
          {totalCount > 0 ? (
            <div className="card slack-work-space-name-card">
              <div className="m-2 text-center">
                <h5 className="fw-bold">
                  {workspaceName != null ? workspaceName : 'Settings #1'}
                </h5>
                <img width={20} height={20} src="/images/slack-integration/growi-bot-kun-icon.png" />
              </div>
            </div>
          ) : ''}
        </div>
      </div>

      <div className="text-center w-25">
        <Bridge errorCount={errorCount} totalCount={totalCount} />
      </div>

      <div className="card rounded-3 shadow border-0 w-50 admin-bot-card mb-0">
        <h5 className="card-title fw-bold mt-3 ms-4">GROWI App</h5>
        <div className="card-body p-4 text-center">
          <div className="border p-2 bg-primary text-light mx-md-5">
            {siteName}
          </div>
        </div>
      </div>
    </div>
  );
};

CustomBotWithoutProxyConnectionStatus.propTypes = {
  siteName: PropTypes.string.isRequired,
  connectionStatuses: PropTypes.object.isRequired,
};

export default CustomBotWithoutProxyConnectionStatus;
