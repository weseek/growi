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
  const permissionTypes = {
    ALLOW_ALL: 'allowAll',
    DENY_ALL: 'denyAll',
    ALLOW_SPECIFIED: 'allowSpecified',
  };

  // TODO: use data from server GW-7006
  const [permissionSettingsForBroadcastUseCommands, setPermissionSettingsForBroadcastUseCommands] = useState({
    search: true,
  });
  const [permissionSettingsForSingleUseCommands, setPermissionSettingsForSingleUseCommands] = useState({
    create: false,
    togetter: [],
  });
  const getInitialCurrentPermissionTypes = () => {
    const getPermissionTypeFromValue = (value) => {
      if (value === true) {
        return permissionTypes.ALLOW_ALL;
      }
      if (value === false) {
        return permissionTypes.DENY_ALL;
      }
      if (Array.isArray(value)) {
        return permissionTypes.ALLOW_SPECIFIED;
      }
    };
    const initialValue = {};
    Object.entries(permissionSettingsForBroadcastUseCommands).forEach((entry) => {
      const [commandName, value] = entry;
      initialValue[commandName] = getPermissionTypeFromValue(value);
    });
    Object.entries(permissionSettingsForSingleUseCommands).forEach((entry) => {
      const [commandName, value] = entry;
      initialValue[commandName] = getPermissionTypeFromValue(value);
    });
    return initialValue;
  };
  const [currentPermissionTypes, setCurrentPermissionTypes] = useState(getInitialCurrentPermissionTypes());

  // returns new state
  const getUpdatedPermissionSettings = (prevState, commandName, value) => {
    const newState = { ...prevState };
    switch (value) {
      case permissionTypes.ALLOW_ALL:
        newState[commandName] = true;
        break;
      case permissionTypes.DENY_ALL:
        newState[commandName] = false;
        break;
      case permissionTypes.ALLOW_SPECIFIED:
        newState[commandName] = [];
        break;
      default:
        logger.error('Not implemented');
        break;
    }

    return newState;
  };

  const updatePermissionSettingsForBroadcastUseCommands = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setPermissionSettingsForBroadcastUseCommands((prevState) => {
      return getUpdatedPermissionSettings(prevState, commandName, value);
    });
    setCurrentPermissionTypes((prevState) => {
      const newState = { ...prevState };
      newState[commandName] = value;
      return newState;
    });
  };

  const updatePermissionSettingsForSingleUseCommands = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setPermissionSettingsForSingleUseCommands((prevState) => {
      return getUpdatedPermissionSettings(prevState, commandName, value);
    });
    setCurrentPermissionTypes((prevState) => {
      const newState = { ...prevState };
      newState[commandName] = value;
      return newState;
    });
  };

  const getUpdatedChannelsList = (prevState, commandName, value) => {
    const newState = { ...prevState };
    // string to array
    const allowedChannelsArray = value.split(',');
    // trim whitespace from all elements
    const trimedAllowedChannelsArray = allowedChannelsArray.map(channelName => channelName.trim());

    prevState[commandName] = trimedAllowedChannelsArray;
    return newState;
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

  const getDefaultValueForChannelsTextArea = (permissionSettings, commandName) => {
    if (permissionSettings[commandName] === undefined) throw new Error('Must be implemented');
    if (typeof permissionSettings[commandName] === 'boolean') return '';

    return permissionSettings[commandName].join(',');
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

        <div className="col-8">
          <p className="font-weight-bold mb-0">Multiple GROWI</p>
          <p className="text-muted mb-2">{t('admin:slack_integration.accordion.multiple_growi_command')}</p>
          <div className="custom-control custom-checkbox">
            <div className="row mb-5 d-block">
              {defaultSupportedCommandsNameForBroadcastUse.map((commandName) => {
                const hiddenClass = currentPermissionTypes[commandName] === permissionTypes.ALLOW_SPECIFIED ? '' : 'd-none';

                return (
                  <div className="row-6 my-1 mb-2" key={commandName}>
                    <div className="row align-items-center mb-3">
                      <p className="col my-auto text-capitalize align-middle">{commandName}</p>
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
                            {currentPermissionTypes[commandName] === permissionTypes.ALLOW_ALL
                            && t('admin:slack_integration.accordion.allow_all')}
                            {currentPermissionTypes[commandName] === permissionTypes.DENY_ALL
                            && t('admin:slack_integration.accordion.deny_all')}
                            {currentPermissionTypes[commandName] === permissionTypes.ALLOW_SPECIFIED
                            && t('admin:slack_integration.accordion.allow_specified')}
                          </span>
                        </button>
                        <div className="dropdown-menu">
                          <button
                            className="dropdown-item"
                            type="button"
                            name={commandName}
                            value={permissionTypes.ALLOW_ALL}
                            onClick={updatePermissionSettingsForBroadcastUseCommands}
                          >
                            {t('admin:slack_integration.accordion.allow_all_long')}
                          </button>
                          <button
                            className="dropdown-item"
                            type="button"
                            name={commandName}
                            value={permissionTypes.DENY_ALL}
                            onClick={updatePermissionSettingsForBroadcastUseCommands}
                          >
                            {t('admin:slack_integration.accordion.deny_all_long')}
                          </button>
                          <button
                            className="dropdown-item"
                            type="button"
                            name={commandName}
                            value={permissionTypes.ALLOW_SPECIFIED}
                            onClick={updatePermissionSettingsForBroadcastUseCommands}
                          >
                            {t('admin:slack_integration.accordion.allow_specified_long')}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={`row-12 row-md-6 ${hiddenClass}`}>
                      <textarea
                        className="form-control"
                        type="textarea"
                        name={commandName}
                        defaultValue={getDefaultValueForChannelsTextArea(permissionSettingsForBroadcastUseCommands, commandName)}
                        onChange={updateChannelsListForBroadcastUseCommands}
                      />
                      <p className="form-text text-muted small">
                        {t('admin:slack_integration.accordion.allowed_channels_description', { commandName })}
                        <br />
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="font-weight-bold mb-0 mt-4">Single GROWI</p>
          <p className="text-muted mb-2">{t('admin:slack_integration.accordion.single_growi_command')}</p>
          <div className="custom-control custom-checkbox">
            <div className="row mb-5 d-block">
              {defaultSupportedCommandsNameForSingleUse.map((commandName) => {
                const hiddenClass = currentPermissionTypes[commandName] === permissionTypes.ALLOW_SPECIFIED ? '' : 'd-none';

                return (
                  <div className="row-6 my-1 mb-2" key={commandName}>
                    <div className="row align-items-center mb-3">
                      <p className="col my-auto text-capitalize align-middle">{commandName}</p>
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
                            {currentPermissionTypes[commandName] === permissionTypes.ALLOW_ALL
                            && t('admin:slack_integration.accordion.allow_all')}
                            {currentPermissionTypes[commandName] === permissionTypes.DENY_ALL
                            && t('admin:slack_integration.accordion.deny_all')}
                            {currentPermissionTypes[commandName] === permissionTypes.ALLOW_SPECIFIED
                            && t('admin:slack_integration.accordion.allow_specified')}
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
                            {t('admin:slack_integration.accordion.allow_all_long')}
                          </button>
                          <button
                            className="dropdown-item"
                            type="button"
                            name={commandName}
                            value={permissionTypes.DENY_ALL}
                            onClick={updatePermissionSettingsForSingleUseCommands}
                          >
                            {t('admin:slack_integration.accordion.deny_all_long')}
                          </button>
                          <button
                            className="dropdown-item"
                            type="button"
                            name={commandName}
                            value={permissionTypes.ALLOW_SPECIFIED}
                            onClick={updatePermissionSettingsForSingleUseCommands}
                          >
                            {t('admin:slack_integration.accordion.allow_specified_long')}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={`row-12 row-md-6 ${hiddenClass}`}>
                      <textarea
                        className="form-control"
                        type="textarea"
                        name={commandName}
                        defaultValue={getDefaultValueForChannelsTextArea(permissionSettingsForSingleUseCommands, commandName)}
                        onChange={updateChannelsListForSingleUseCommands}
                      />
                      <p className="form-text text-muted small">
                        {t('admin:slack_integration.accordion.allowed_channels_description', { commandName })}
                        <br />
                      </p>
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
  // TODO: DEFINE PROP TYPES GW-7006
  // supportedCommandsForBroadcastUse: PropTypes.object.isRequired,
  // supportedCommandsForSingleUse: PropTypes.object.isRequired,
  supportedCommandsForBroadcastUse: PropTypes.arrayOf(PropTypes.string),
  supportedCommandsForSingleUse: PropTypes.arrayOf(PropTypes.string),
};

export default ManageCommandsProcess;
