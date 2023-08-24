import React from 'react';
import PropTypes from 'prop-types';
import Bridge from './Bridge';

const CustomBotWithProxyConnectionStatus = (props) => {
  const { siteName, connectionStatuses } = props;

  const connectionStatusValues = Object.values(connectionStatuses); // type: ConnectionStatus[]

  const totalCount = connectionStatusValues.length;
  const errorCount = connectionStatusValues.filter(connectionStatus => connectionStatusValues.error != null).length;

  return (
    <div className="d-flex justify-content-center my-5 bot-integration">

      <div className="card rounded shadow border-0 w-50 admin-bot-card">
        <h5 className="card-title font-weight-bold mt-3 ms-3">Slack</h5>
        <div className="card-body px-5">
          {connectionStatusValues.map((connectionStatus, i) => {
            const workspaceName = connectionStatus.workspaceName || `Settings #${i}`;

            return (
              <div key={workspaceName} className="card slack-work-space-name-card">
                <div className="m-2 text-center">
                  <h5 className="font-weight-bold">{workspaceName}</h5>
                  <img width={20} height={20} src="/images/slack-integration/growi-bot-kun-icon.png" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center w-25 mt-3">
        <Bridge errorCount={errorCount} totalCount={totalCount} withProxy />
      </div>

      <div className="card rounded-lg shadow border-0 w-50 admin-bot-card">
        <h5 className="card-title font-weight-bold mt-3 ms-3">GROWI App</h5>
        <div className="card-body text-center">
          <div className="mx-md-3 my-4 my-lg-5 p-2 border bg-primary text-light">
            {siteName}
          </div>
        </div>
      </div>
    </div>
  );
};

CustomBotWithProxyConnectionStatus.propTypes = {
  siteName: PropTypes.string.isRequired,
  connectionStatuses: PropTypes.object.isRequired,
};

export default CustomBotWithProxyConnectionStatus;
