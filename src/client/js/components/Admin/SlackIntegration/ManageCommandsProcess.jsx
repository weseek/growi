import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { defaultSupportedCommandsNameForBroadcastUse, defaultSupportedCommandsNameForSingleUse } from '@growi/slack';
import { toastSuccess, toastError } from '../../../util/apiNotification';

const logger = loggerFactory('growi:SlackIntegration:ManageCommandsProcess');

const ManageCommandsProcess = ({
  apiv3Put, slackAppIntegrationId, supportedCommandsForBroadcastUse, supportedCommandsForSingleUse,
}) => {
  const { t } = useTranslation();
  const [selectedCommandsForBroadcastUse, setSelectedCommandsForBroadcastUse] = useState(new Set(supportedCommandsForBroadcastUse));
  const [selectedCommandsForSingleUse, setSelectedCommandsForSingleUse] = useState(new Set(supportedCommandsForSingleUse));

  const toggleCheckboxForBroadcast = (e) => {
    const { target } = e;
    const { name, checked } = target;

    setSelectedCommandsForBroadcastUse((prevState) => {
      const selectedCommands = new Set(prevState);
      if (checked) {
        selectedCommands.add(name);
      }
      else {
        selectedCommands.delete(name);
      }

      return selectedCommands;
    });
  };

  const toggleCheckboxForSingleUse = (e) => {
    const { target } = e;
    const { name, checked } = target;

    setSelectedCommandsForSingleUse((prevState) => {
      const selectedCommands = new Set(prevState);
      if (checked) {
        selectedCommands.add(name);
      }
      else {
        selectedCommands.delete(name);
      }

      return selectedCommands;
    });
  };

  const updateCommandsHandler = async() => {
    try {
      await apiv3Put(`/slack-integration-settings/${slackAppIntegrationId}/supported-commands`, {
        supportedCommandsForBroadcastUse: Array.from(selectedCommandsForBroadcastUse),
        supportedCommandsForSingleUse: Array.from(selectedCommandsForSingleUse),
      });
      toastSuccess(t('toaster.update_successed', { target: 'Token' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };


  return (
    <div className="py-4 px-5">
      <p className="mb-4">{t('admin:slack_integration.accordion.manage_commands')}</p>
      <span className="mb-2">Broadcast Use</span>
      <div className="custom-control custom-checkbox">
        <div className="row mb-5">
          {defaultSupportedCommandsNameForBroadcastUse.map((commandName) => {
            return (
              <div className="col-sm-6 my-1" key={commandName}>
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={commandName}
                  name={commandName}
                  value={commandName}
                  checked={selectedCommandsForBroadcastUse.has(commandName)}
                  onChange={toggleCheckboxForBroadcast}
                />
                <label className="text-capitalize custom-control-label ml-3" htmlFor={commandName}>
                  {commandName}
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <span className="mb-2">Single Use</span>
      <div className="custom-control custom-checkbox">
        <div className="row mb-5">
          {defaultSupportedCommandsNameForSingleUse.map((commandName) => {
            return (
              <div className="col-sm-6 my-1" key={commandName}>
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={commandName}
                  name={commandName}
                  value={commandName}
                  checked={selectedCommandsForSingleUse.has(commandName)}
                  onChange={toggleCheckboxForSingleUse}
                />
                <label className="text-capitalize custom-control-label ml-3" htmlFor={commandName}>
                  {commandName}
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className="row">
        <button
          type="button"
          className="btn btn-primary mx-auto"
          onClick={updateCommandsHandler}
        >
          { t('Update') }
        </button>
      </div>
    </div>
  );
};

ManageCommandsProcess.propTypes = {
  apiv3Put: PropTypes.func,
  slackAppIntegrationId: PropTypes.string.isRequired,
  supportedCommandsForBroadcastUse: PropTypes.arrayOf(PropTypes.string),
  supportedCommandsForSingleUse: PropTypes.arrayOf(PropTypes.string),
};

export default ManageCommandsProcess;
