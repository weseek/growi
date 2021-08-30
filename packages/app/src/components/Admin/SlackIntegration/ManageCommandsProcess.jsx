import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { defaultSupportedCommandsNameForBroadcastUse, defaultSupportedCommandsNameForSingleUse } from '@growi/slack';
import loggerFactory from '~/utils/logger';

import { toastSuccess, toastError } from '../../../client/util/apiNotification';

const logger = loggerFactory('growi:SlackIntegration:ManageCommandsProcess');

// TODO: Add permittedChannelsForEachCommand to use data from server (props must have it) GW-7006
const ManageCommandsProcess = ({
  apiv3Put, slackAppIntegrationId, supportedCommandsForBroadcastUse, supportedCommandsForSingleUse,
}) => {
  const { t } = useTranslation();
  // TODO: use data from server GW-7006
  const [permissionSettingsForBroadcastUseCommands, setPermissionSettingsForBroadcastUseCommands] = useState({});
  const [permissionSettingsForSingleUseCommands, setPermissionSettingsForSingleUseCommands] = useState({});

  const permissionTypes = {
    ALLOW_ALL: 'allowAll',
    DENY_ALL: 'denyAll',
    ALLOW_SPECIFIED: 'allowSpecified',
  };

  const getCurrentPermissionTypeOfCommand = (state, commandName) => {
    if (state[commandName] === true) {
      return permissionTypes.ALLOW_ALL;
    }
    if (state[commandName] === false) {
      return permissionTypes.DENY_ALL;
    }
    if (Array.isArray(state[commandName])) {
      return permissionTypes.ALLOW_SPECIFIED;
    }
    return new Error('Not implemented');
  };

  const getUpdatedPermissionSettings = (prevState, commandName, value) => {
    switch (value) {
      case permissionTypes.ALLOW_ALL:
        prevState[commandName] = true;
        break;
      case permissionTypes.DENY_ALL:
        prevState[commandName] = false;
        break;
      case permissionTypes.ALLOW_SPECIFIED:
        prevState[commandName] = [];
        break;
      default:
        logger.error('Not implemented');
        break;
    }

    return prevState;
  };

  const updatePermissionSettingsForBroadcastUseCommands = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setPermissionSettingsForBroadcastUseCommands((prevState) => {
      return getUpdatedPermissionSettings(prevState, commandName, value);
    });
  };

  const updatePermissionSettingsForSingleUseCommands = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setPermissionSettingsForSingleUseCommands((prevState) => {
      return getUpdatedPermissionSettings(prevState, commandName, value);
    });
  };

  const getUpdatedChannelsList = (prevState, commandName, value) => {
    // string to array
    const allowedChannelsArray = value.split(',');
    // trim whitespace from all elements
    const trimedAllowedChannelsArray = allowedChannelsArray.map(channelName => channelName.trim());

    prevState[commandName] = trimedAllowedChannelsArray;
    return prevState;
  };

  const updateChannelsListForBroadcastUseCommands = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;
    // update state
    setPermissionSettingsForBroadcastUseCommands((prevState) => {
      return getUpdatedChannelsList(prevState, commandName, value);
    });
  };

  const updateChannelsListForSingleUseCommands = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;
    // update state
    setPermissionSettingsForSingleUseCommands((prevState) => {
      return getUpdatedChannelsList(prevState, commandName, value);
    });
  };

  // TODO: UPDATE API AND REWRITE HERE GW-7006
  const updateCommandsHandler = async() => {
    try {
      await apiv3Put(`/slack-integration-settings/${slackAppIntegrationId}/supported-commands`, {
        supportedCommandsForBroadcastUse: ['REWRITE'],
        supportedCommandsForSingleUse: ['REWRITE'],
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
      <p className="mb-4 font-weight-bold">{t('admin:slack_integration.accordion.manage_commands')}</p>
      <div className="row d-flex flex-column align-items-center">

        <div className="col-md-6">
          <p className="font-weight-bold mb-0">Multiple GROWI</p>
          <p className="text-muted mb-2">{t('admin:slack_integration.accordion.multiple_growi_command')}</p>
          <div className="pl-5 custom-control custom-checkbox">
            <div className="row mb-5 d-block">
              {defaultSupportedCommandsNameForBroadcastUse.map((commandName) => {
                return (<div></div>);
              })}
            </div>
          </div>

          <p className="font-weight-bold mb-0 mt-4">Single GROWI</p>
          <p className="text-muted mb-2">{t('admin:slack_integration.accordion.single_growi_command')}</p>
          <div className="pl-5 custom-control custom-checkbox">
            <div className="row mb-5 d-block">
              {['create', 'togetter'].map((commandName) => {
                const hiddenClass = '' || 'd-hidden';
                const currentPermissionType = getCurrentPermissionTypeOfCommand(permissionSettingsForSingleUseCommands, commandName);

                return (
                  <div className="row-6 my-1 mb-2" key={commandName}>
                    <div className="row">
                      <div className="col">
                        <p className="text-capitalize text-center">{commandName}</p>
                      </div>
                      <div className="col dropdown">
                        <button
                          className="btn btn-outline-secondary dropdown-toggle text-right col-12 col-md-auto"
                          type="button"
                          id="dropdownMenuButton"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="true"
                        >
                          <span className="float-left">
                            {/* TODO: IMPLEMENT THIS */}
                            {true && t('MUST BE IMPLEMENTED')}
                            {currentPermissionType === permissionTypes.ALLOW_ALL && t('MUST BE IMPLEMENTED')}
                            {currentPermissionType === permissionTypes.DENY_ALL && t('MUST BE IMPLEMENTED')}
                            {currentPermissionType === permissionTypes.ALLOW_SPECIFIED && t('MUST BE IMPLEMENTED')}
                          </span>
                        </button>
                        <div className="dropdown-menu">
                          <button
                            className="dropdown-item"
                            type="button"
                            name={commandName}
                            value={permissionTypes.ALLOW_ALL}
                            onClick={updatePermissionSettingsForSingleUseCommands}
                          >
                            TRANSLATE ALLOW FROM ALL
                          </button>
                          <button
                            className="dropdown-item"
                            type="button"
                            name={commandName}
                            value={permissionTypes.DENY_ALL}
                            onClick={updatePermissionSettingsForSingleUseCommands}
                          >
                            TRANSLATE DENY FROM ALL
                          </button>
                          <button
                            className="dropdown-item"
                            type="button"
                            name={commandName}
                            value={permissionTypes.ALLOW_SPECIFIED}
                            onClick={updatePermissionSettingsForSingleUseCommands}
                          >
                            TRANSLATE ALLOW FROM ONLY SPECIFIED CHANNELS
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="row HIDDEN_FALSE_WHEN_ALLOW_SPECIFIED">
                      <div className={`row-12 row-md-6 ${hiddenClass}`}>
                        <textarea
                          className="form-control"
                          type="textarea"
                          name={commandName}
                          defaultValue="GET FROM DATA"
                          onChange={updateChannelsListForSingleUseCommands}
                        />
                        <p className="form-text text-muted small">
                          {t('admin:slack_integration.accordion.allowed_channels_description', { commandName })}
                          <br />
                        </p>
                      </div>
                    </div>
                  </div>
                );

              })}
            </div>
          </div>
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
  // TODO: validate props originally from SlackIntegration.jsx. Use PropTypes.shape() maybe GW-7006
  // permittedChannelsForEachCommand: PropTypes.object.isRequired,
};

export default ManageCommandsProcess;
