import React, { useCallback, useState } from 'react';
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

// A utility function that returns the new state but identical to the previous state
const getUpdatedChannelsList = (prevState, commandName, value) => {
  // string to array
  const allowedChannelsArray = value.split(',');
  // trim whitespace from all elements
  const trimedAllowedChannelsArray = allowedChannelsArray.map(channelName => channelName.trim());

  prevState[commandName] = trimedAllowedChannelsArray;
  return prevState;
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

// A utility function that returns the permission type from the permission value
const getPermissionTypeFromValue = (value) => {
  if (Array.isArray(value)) {
    return PermissionTypes.ALLOW_SPECIFIED;
  }
  if (typeof value === 'boolean') {
    return value ? PermissionTypes.ALLOW_ALL : PermissionTypes.DENY_ALL;
  }
  logger.error('The value type must be boolean or string[]');
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const ManageCommandsProcess = ({
  apiv3Put, slackAppIntegrationId, permissionsForBroadcastUseCommands, permissionsForSingleUseCommands,
}) => {
  const { t } = useTranslation();

  const [permissionsForBroadcastUseCommandsState, setPermissionsForBroadcastUseCommandsState] = useState({
    search: permissionsForBroadcastUseCommands.search,
  });
  const [permissionsForSingleUseCommandsState, setPermissionsForSingleUseCommandsState] = useState({
    note: permissionsForSingleUseCommands.note,
    keep: permissionsForSingleUseCommands.keep,
  });
  const [currentPermissionTypes, setCurrentPermissionTypes] = useState(() => {
    const initialState = {};
    Object.entries(permissionsForBroadcastUseCommandsState).forEach((entry) => {
      const [commandName, value] = entry;
      initialState[commandName] = getPermissionTypeFromValue(value);
    });
    Object.entries(permissionsForSingleUseCommandsState).forEach((entry) => {
      const [commandName, value] = entry;
      initialState[commandName] = getPermissionTypeFromValue(value);
    });
    return initialState;
  });

  const updatePermissionsForBroadcastUseCommandsState = useCallback((e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setPermissionsForBroadcastUseCommandsState(prev => getUpdatedPermissionSettings(prev, commandName, value));
    setCurrentPermissionTypes((prevState) => {
      const newState = { ...prevState };
      newState[commandName] = value;
      return newState;
    });
  }, []);

  const updatePermissionsForSingleUseCommandsState = useCallback((e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setPermissionsForSingleUseCommandsState(prev => getUpdatedPermissionSettings(prev, commandName, value));
    setCurrentPermissionTypes((prevState) => {
      const newState = { ...prevState };
      newState[commandName] = value;
      return newState;
    });
  }, []);

  const updateChannelsListForBroadcastUseCommandsState = useCallback((e) => {
    const { target } = e;
    const { name: commandName, value } = target;
    // update state
    setPermissionsForBroadcastUseCommandsState(prev => getUpdatedChannelsList(prev, commandName, value));
  }, []);

  const updateChannelsListForSingleUseCommandsState = useCallback((e) => {
    const { target } = e;
    const { name: commandName, value } = target;
    // update state
    setPermissionsForSingleUseCommandsState(prev => getUpdatedChannelsList(prev, commandName, value));
  }, []);

  const updateCommandsHandler = async(e) => {
    try {
      await apiv3Put(`/slack-integration-settings/slack-app-integrations/${slackAppIntegrationId}/supported-commands`, {
        permissionsForBroadcastUseCommands: permissionsForBroadcastUseCommandsState,
        permissionsForSingleUseCommands: permissionsForSingleUseCommandsState,
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
      <div className="my-1 mb-2">
        <div className="row align-items-center mb-3">
          <p className="col-md-5 text-md-right text-capitalize mb-2"><strong>{commandName}</strong></p>
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
        <div className={`row ${hiddenClass}`}>
          <div className="col-md-7 offset-md-5">
            <textarea
              className="form-control"
              type="textarea"
              name={commandName}
              defaultValue={textareaDefaultValue}
              onChange={isCommandBroadcastUse ? updateChannelsListForBroadcastUseCommandsState : updateChannelsListForSingleUseCommandsState}
            />
            <p className="form-text text-muted small">
              {t('admin:slack_integration.accordion.allowed_channels_description', { commandName })}
              <br />
            </p>
          </div>
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
        <div className="row">
          <div className="col-md-7 offset-md-2">
            <p className="font-weight-bold mb-1">{isCommandBroadcastUse ? 'Multiple GROWI' : 'Single GROWI'}</p>
            <p className="text-muted">
              {isCommandBroadcastUse
                ? t('admin:slack_integration.accordion.multiple_growi_command')
                : t('admin:slack_integration.accordion.single_growi_command')}
            </p>
          </div>
        </div>
        <div className="custom-control custom-checkbox">
          <div className="row mb-5 d-block">
            {defaultCommandsName.map((commandName) => {
              // eslint-disable-next-line max-len
              return <PermissionSettingForEachCommandComponent key={`${commandName}-component`} commandName={commandName} commandUsageType={commandUsageType} />;
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
            return <PermissionSettingsForEachCommandTypeComponent key={commandUsageType} commandUsageType={commandUsageType} />;
          })}
        </div>
      </div>
      <div className="row">
        <button
          type="submit"
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
