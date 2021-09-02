import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { defaultSupportedCommandsNameForBroadcastUse, defaultSupportedCommandsNameForSingleUse } from '@growi/slack';
import loggerFactory from '~/utils/logger';

import { toastSuccess, toastError } from '../../../client/util/apiNotification';

const logger = loggerFactory('growi:SlackIntegration:ManageCommandsProcess');

const PermissionTypes = {
  ALLOW_ALL: 'allowAll',
  DENY_ALL: 'denyAll',
  ALLOW_SPECIFIED: 'allowSpecified',
};

const CommandUsageTypes = {
  BROADCAST_USE: 'broadcastUse',
  SINGLE_USE: 'singleUse',
};

// A utility function that returns the new state
const getUpdatedChannelsList = (prevState, commandName, value) => {
  const newState = { ...prevState };
  // string to array
  const allowedChannelsArray = value.split(',');
  // trim whitespace from all elements
  const trimedAllowedChannelsArray = allowedChannelsArray.map(channelName => channelName.trim());

  prevState[commandName] = trimedAllowedChannelsArray;
  return newState;
};

// A utility function that returns the new state
const getUpdatedPermissionSettings = (prevState, commandName, value) => {
  const newState = { ...prevState };
  switch (value) {
    case PermissionTypes.ALLOW_ALL:
      newState[commandName] = true;
      break;
    case PermissionTypes.DENY_ALL:
      newState[commandName] = false;
      break;
    case PermissionTypes.ALLOW_SPECIFIED:
      newState[commandName] = [];
      break;
    default:
      logger.error('Not implemented');
      break;
  }

  return newState;
};

// TODO: Add permittedChannelsForEachCommand to use data from server (props must have it) GW-7006
const ManageCommandsProcess = ({
  apiv3Put, slackAppIntegrationId, permissionsForBroadcastUseCommands, permissionsForSingleUseCommands,
}) => {
  const { t } = useTranslation();

  // TODO: use data from server GW-7006
  const [permissionsForBroadcastUseCommandsState, setPermissionsForBroadcastUseCommandsState] = useState({
    search: true,
  });
  const [permissionsForSingleUseCommandsState, setPermissionsForSingleUseCommandsState] = useState({
    create: false,
    togetter: [],
  });
  const getInitialCurrentPermissionTypes = () => {
    const getPermissionTypeFromValue = (value) => {
      if (Array.isArray(value)) {
        return PermissionTypes.ALLOW_SPECIFIED;
      }
      if (typeof value === 'boolean') {
        return value ? PermissionTypes.ALLOW_ALL : PermissionTypes.DENY_ALL;
      }
      logger.error('The value type must be boolean or string[]');
    };
    const initialValue = {};
    Object.entries(permissionsForBroadcastUseCommandsState).forEach((entry) => {
      const [commandName, value] = entry;
      initialValue[commandName] = getPermissionTypeFromValue(value);
    });
    Object.entries(permissionsForSingleUseCommandsState).forEach((entry) => {
      const [commandName, value] = entry;
      initialValue[commandName] = getPermissionTypeFromValue(value);
    });
    return initialValue;
  };
  const [currentPermissionTypes, setCurrentPermissionTypes] = useState(getInitialCurrentPermissionTypes());

  const updatePermissionsForBroadcastUseCommandsState = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setPermissionsForBroadcastUseCommandsState((prevState) => {
      return getUpdatedPermissionSettings(prevState, commandName, value);
    });
    setCurrentPermissionTypes((prevState) => {
      const newState = { ...prevState };
      newState[commandName] = value;
      return newState;
    });
  };

  const updatePermissionsForSingleUseCommandsState = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setPermissionsForSingleUseCommandsState((prevState) => {
      return getUpdatedPermissionSettings(prevState, commandName, value);
    });
    setCurrentPermissionTypes((prevState) => {
      const newState = { ...prevState };
      newState[commandName] = value;
      return newState;
    });
  };

  const updateChannelsListForBroadcastUseCommandsState = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;
    // update state
    setPermissionsForBroadcastUseCommandsState((prevState) => {
      return getUpdatedChannelsList(prevState, commandName, value);
    });
  };

  const updateChannelsListForSingleUseCommandsState = (e) => {
    const { target } = e;
    const { name: commandName, value } = target;
    // update state
    setPermissionsForSingleUseCommandsState((prevState) => {
      return getUpdatedChannelsList(prevState, commandName, value);
    });
  };

  // TODO: UPDATE API AND REWRITE HERE GW-7006
  const updateCommandsHandler = async() => {
    try {
      await apiv3Put(`/slack-integration-settings/${slackAppIntegrationId}/supported-commands`, {
        permissionsForBroadcastUseCommands: ['REWRITE'],
        permissionsForSingleUseCommands: ['REWRITE'],
      });
      toastSuccess(t('toaster.update_successed', { target: 'Token' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  const PermissionSettingForEachCommandComponent = ({ commandName, commandUsageType }) => {
    const hiddenClass = currentPermissionTypes[commandName] === PermissionTypes.ALLOW_SPECIFIED ? '' : 'd-none';
    const isCommandBroadcastUse = commandUsageType === CommandUsageTypes.BROADCAST_USE;

    const permissionSettings = isCommandBroadcastUse ? permissionsForBroadcastUseCommandsState : permissionsForSingleUseCommandsState;
    const permission = permissionSettings[commandName];
    if (permission === undefined) logger.error('Must be implemented');

    const textareaDefaultValue = Array.isArray(permission) ? permission.join(',') : '';

    return (
      <div className="my-1 mb-2" key={commandName}>
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
                {currentPermissionTypes[commandName] === PermissionTypes.ALLOW_ALL
                && t('admin:slack_integration.accordion.allow_all')}
                {currentPermissionTypes[commandName] === PermissionTypes.DENY_ALL
                && t('admin:slack_integration.accordion.deny_all')}
                {currentPermissionTypes[commandName] === PermissionTypes.ALLOW_SPECIFIED
                && t('admin:slack_integration.accordion.allow_specified')}
              </span>
            </button>
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                type="button"
                name={commandName}
                value={PermissionTypes.ALLOW_ALL}
                onClick={isCommandBroadcastUse ? updatePermissionsForBroadcastUseCommandsState : updatePermissionsForSingleUseCommandsState}
              >
                {t('admin:slack_integration.accordion.allow_all_long')}
              </button>
              <button
                className="dropdown-item"
                type="button"
                name={commandName}
                value={PermissionTypes.DENY_ALL}
                onClick={isCommandBroadcastUse ? updatePermissionsForBroadcastUseCommandsState : updatePermissionsForSingleUseCommandsState}
              >
                {t('admin:slack_integration.accordion.deny_all_long')}
              </button>
              <button
                className="dropdown-item"
                type="button"
                name={commandName}
                value={PermissionTypes.ALLOW_SPECIFIED}
                onClick={isCommandBroadcastUse ? updatePermissionsForBroadcastUseCommandsState : updatePermissionsForSingleUseCommandsState}
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
            defaultValue={textareaDefaultValue}
            onClick={isCommandBroadcastUse ? updateChannelsListForBroadcastUseCommandsState : updateChannelsListForSingleUseCommandsState}
          />
          <p className="form-text text-muted small">
            {t('admin:slack_integration.accordion.allowed_channels_description', { commandName })}
            <br />
          </p>
        </div>
      </div>
    );
  };

  PermissionSettingForEachCommandComponent.propTypes = {
    commandName: PropTypes.string,
    commandUsageType: PropTypes.string,
  };

  const PermissionSettingsForEachCommandTypeComponent = ({ commandUsageType }) => {
    const isCommandBroadcastUse = commandUsageType === CommandUsageTypes.BROADCAST_USE;
    const defaultCommandsName = isCommandBroadcastUse ? defaultSupportedCommandsNameForBroadcastUse : defaultSupportedCommandsNameForSingleUse;
    return (
      <>
        <p className="font-weight-bold mb-0">{isCommandBroadcastUse ? 'Multiple GROWI' : 'Single GROWI'}</p>
        <p className="text-muted mb-2">
          {isCommandBroadcastUse ? t('admin:slack_integration.accordion.multiple_growi_command') : t('admin:slack_integration.accordion.single_growi_command')}
        </p>
        <div className="custom-control custom-checkbox">
          <div className="row mb-5 d-block">
            {defaultCommandsName.map((commandName) => {
              return <PermissionSettingForEachCommandComponent commandName={commandName} commandUsageType={commandUsageType} />;
            })}
          </div>
        </div>
      </>
    );
  };

  PermissionSettingsForEachCommandTypeComponent.propTypes = {
    commandUsageType: PropTypes.string,
  };


  return (
    <div className="py-4 px-5">
      <p className="mb-4 font-weight-bold">{t('admin:slack_integration.accordion.manage_commands')}</p>
      <div className="row d-flex flex-column align-items-center">

        <div className="col-8">
          {Object.values(CommandUsageTypes).map((commandUsageType) => {
            return <PermissionSettingsForEachCommandTypeComponent commandUsageType={commandUsageType} />;
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
  permissionsForBroadcastUseCommands: PropTypes.object.isRequired,
  permissionsForSingleUseCommands: PropTypes.object.isRequired,
};

export default ManageCommandsProcess;
