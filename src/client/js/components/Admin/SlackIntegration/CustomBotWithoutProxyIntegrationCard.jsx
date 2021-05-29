import React from 'react';
import PropTypes from 'prop-types';
import IntegrationStatus from './IntegrationStatus';

const CustomBotWithoutProxyIntegrationCard = (props) => {
  const { siteName, connectionStatusArray, isConnectedFailed } = props;
  const isEmptyConnectionStatusArray = (connectionStatusArray.length === 0);

  let workspaceName;
  if (!isEmptyConnectionStatusArray) {
    workspaceName = connectionStatusArray[0].workspaceName;
  }

  return (
    <div className="d-flex justify-content-center my-5 bot-integration">
      <div className="card rounded shadow border-0 w-50 admin-bot-card mb-0">
        <h5 className="card-title font-weight-bold mt-3 ml-4">Slack</h5>
        <div className="card-body p-2 w-50 mx-auto">
          {isEmptyConnectionStatusArray ? '' : (
            <div className="card slack-work-space-name-card">
              <div className="m-2 text-center">
                <h5 className="font-weight-bold">
                  {isConnectedFailed ? 'Setting #1' : workspaceName}
                </h5>
                <img width={20} height={20} src="/images/slack-integration/growi-bot-kun-icon.png" />
              </div>
            </div>
         )}
        </div>
      </div>

      <div className="text-center w-25">
        <IntegrationStatus workspaceNames={[workspaceName]} isWithoutProxy />
      </div>

      <div className="card rounded-lg shadow border-0 w-50 admin-bot-card mb-0">
        <h5 className="card-title font-weight-bold mt-3 ml-4">GROWI App</h5>
        <div className="card-body p-4 mb-5 text-center">
          <div className="border p-2 bg-primary text-light mx-5">
            {siteName}
          </div>
        </div>
      </div>
    </div>
  );
};

CustomBotWithoutProxyIntegrationCard.propTypes = {
  siteName: PropTypes.string.isRequired,
  connectionStatusArray: PropTypes.array.isRequired,
  isConnectedFailed: PropTypes.bool.isRequired,
};

export default CustomBotWithoutProxyIntegrationCard;
