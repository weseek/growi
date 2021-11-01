import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { defaultSupportedCommandsNameForBroadcastUse, defaultSupportedCommandsNameForSingleUse, defaultSupportedSlackEventActions } from '@growi/slack';
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

const EventTypes = {
  UNFURL: 'unfurl',
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
  apiv3Put, slackAppIntegrationId, permissionsForBroadcastUseCommands, permissionsForSingleUseCommands, permissionsForSlackEventActions,
}) => {
  const { t } = useTranslation();

  const [permissionsForBroadcastUseCommandsState, setPermissionsForBroadcastUseCommandsState] = useState({
    search: permissionsForBroadcastUseCommands.search,
  });
  const [permissionsForSingleUseCommandsState, setPermissionsForSingleUseCommandsState] = useState({
    note: permissionsForSingleUseCommands.note,
    keep: permissionsForSingleUseCommands.keep,
  });
  const [permissionsForEventsState, setPermissionsForEventsState] = useState({
    unfurl: permissionsForSlackEventActions.unfurl,
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
    Object.entries(permissionsForEventsState).forEach((entry) => {
      const [commandName, value] = entry;
      initialState[commandName] = getPermissionTypeFromValue(value);
    });
    return initialState;
  });


  const updateCommandsHandler = async(e) => {
    try {
      // TODO: add new attribute 78975
      await apiv3Put(`/slack-integration-settings/slack-app-integrations/${slackAppIntegrationId}/permissions`, {
        permissionsForBroadcastUseCommands: permissionsForBroadcastUseCommandsState,
        permissionsForSingleUseCommands: permissionsForSingleUseCommandsState,
        permissionsForSlackEventActions: permissionsForEventsState,
      });
      toastSuccess(t('toaster.update_successed', { target: 'Token' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  const PermissionSettingForEachCommandComponent = ({
    commandName, usageType, onUpdatePermissions, onUpdateChannels, singleCommandDescription, allowedChannelsDescription,
  }) => {
    const hiddenClass = currentPermissionTypes[commandName] === PermissionTypes.ALLOW_SPECIFIED ? '' : 'd-none';

    const permissionMap = {
      broadcastUse: permissionsForBroadcastUseCommandsState,
      singleUse: permissionsForSingleUseCommandsState,
      unfurl: permissionsForEventsState,
    };

    const permissionSettings = permissionMap[usageType];
    const permission = permissionSettings[commandName];

    if (permission === undefined) logger.error('Must be implemented');

    const textareaDefaultValue = Array.isArray(permission) ? permission.join(',') : '';

    return (
      <div className="my-1 mb-2">
        <div className="row align-items-center mb-3">
          <p className="col-md-5 text-md-right mb-2">
            <strong className="text-capitalize">{commandName}</strong>
            {singleCommandDescription && (
              <small className="form-text text-muted small">
                { singleCommandDescription }
              </small>
            )}
          </p>
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
                onClick={onUpdatePermissions}
              >
                {t('admin:slack_integration.accordion.allow_all_long')}
              </button>
              <button
                className="dropdown-item"
                type="button"
                name={commandName}
                value={PermissionTypes.DENY_ALL}
                onClick={onUpdatePermissions}
              >
                {t('admin:slack_integration.accordion.deny_all_long')}
              </button>
              <button
                className="dropdown-item"
                type="button"
                name={commandName}
                value={PermissionTypes.ALLOW_SPECIFIED}
                onClick={onUpdatePermissions}
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
              onChange={onUpdateChannels}
            />
            <p className="form-text text-muted small">
              {allowedChannelsDescription(commandName)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  PermissionSettingForEachCommandComponent.propTypes = {
    commandName: PropTypes.string,
    usageType: PropTypes.string,
    singleCommandDescription: PropTypes.string,
    onUpdatePermissions: PropTypes.func,
    onUpdateChannels: PropTypes.func,
    allowedChannelsDescription: PropTypes.func,
  };

  const PermissionSettingsForEachCommandTypeComponent = ({ usageType }) => {
    const handleUpdateSingleUsePermissions = useCallback((e) => {
      const { target } = e;
      const { name: commandName, value } = target;
      setPermissionsForSingleUseCommandsState(prev => getUpdatedPermissionSettings(prev, commandName, value));
      setCurrentPermissionTypes((prevState) => {
        const newState = { ...prevState };
        newState[commandName] = value;
        return newState;
      });
    }, []);

    const handleUpdateBroadcastUsePermissions = useCallback((e) => {
      const { target } = e;
      const { name: commandName, value } = target;
      setPermissionsForBroadcastUseCommandsState(prev => getUpdatedPermissionSettings(prev, commandName, value));
      setCurrentPermissionTypes((prevState) => {
        const newState = { ...prevState };
        newState[commandName] = value;
        return newState;
      });
    }, []);

    const handleUpdateEventsPermissions = useCallback((e) => {
      const { target } = e;
      const { name: commandName, value } = target;
      setPermissionsForEventsState(prev => getUpdatedPermissionSettings(prev, commandName, value));
      setCurrentPermissionTypes((prevState) => {
        const newState = { ...prevState };
        newState[commandName] = value;
        return newState;
      });
    }, []);

    const handleUpdateSingleUseChannels = useCallback((e) => {
      const { target } = e;
      const { name: commandName, value } = target;
      setPermissionsForSingleUseCommandsState(prev => getUpdatedChannelsList(prev, commandName, value));
    }, []);

    const handleUpdateBroadcastUseChannels = useCallback((e) => {
      const { target } = e;
      const { name: commandName, value } = target;
      setPermissionsForBroadcastUseCommandsState(prev => getUpdatedChannelsList(prev, commandName, value));
    }, []);

    const handleUpdateEventsChannels = useCallback((e) => {
      const { target } = e;
      const { name: commandName, value } = target;
      setPermissionsForEventsState(prev => getUpdatedChannelsList(prev, commandName, value));
    }, []);

    const menuItems = {
      broadcastUse: {
        title: 'Multiple GROWI',
        description: t('admin:slack_integration.accordion.multiple_growi_command'),
        defaultCommandsName: defaultSupportedCommandsNameForBroadcastUse,
        updatePermissionsHandler: handleUpdateBroadcastUsePermissions,
        updateChannelsHandler: handleUpdateBroadcastUseChannels,
        allowedChannelsDescription: commandName => t('admin:slack_integration.accordion.allowed_channels_description', { commandName }),
      },
      singleUse: {
        title: 'Single GROWI',
        description: t('admin:slack_integration.accordion.single_growi_command'),
        defaultCommandsName: defaultSupportedCommandsNameForSingleUse,
        updatePermissionsHandler: handleUpdateSingleUsePermissions,
        updateChannelsHandler: handleUpdateSingleUseChannels,
        allowedChannelsDescription: commandName => t('admin:slack_integration.accordion.allowed_channels_description', { commandName }),
      },
      unfurl: {
        defaultCommandsName: defaultSupportedSlackEventActions,
        updatePermissionsHandler: handleUpdateEventsPermissions,
        updateChannelsHandler: handleUpdateEventsChannels,
        singleCommandDescription: t('admin:slack_integration.accordion.unfurl_description'),
        allowedChannelsDescription: _commandName => t('admin:slack_integration.accordion.unfurl_allowed_channels_description'),
      },
    };

    const currentMenu = menuItems[usageType];

    return (
      <>
        {(currentMenu.title || currentMenu.description)
          && (
            <div className="row">
              <div className="col-md-7 offset-md-2">
                { currentMenu.title && <p className="font-weight-bold mb-1">{currentMenu.title}</p> }
                { currentMenu.description && <p className="text-muted">{currentMenu.description}</p> }
              </div>
            </div>
          )
        }

        <div className="custom-control custom-checkbox">
          <div className="row mb-5 d-block">
            {currentMenu.defaultCommandsName.map((commandName) => {
              // eslint-disable-next-line max-len
              return (
                <PermissionSettingForEachCommandComponent
                  key={`${commandName}-component`}
                  commandName={commandName}
                  usageType={usageType}
                  singleCommandDescription={currentMenu.singleCommandDescription}
                  onUpdatePermissions={currentMenu.updatePermissionsHandler}
                  onUpdateChannels={currentMenu.updateChannelsHandler}
                  allowedChannelsDescription={currentMenu.allowedChannelsDescription}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  };

  PermissionSettingsForEachCommandTypeComponent.propTypes = {
    usageType: PropTypes.string,
  };


  return (
    <div className="py-4 px-5">
      <p className="mb-4 font-weight-bold">{t('admin:slack_integration.accordion.manage_commands')}</p>
      <div className="row d-flex flex-column align-items-center">
        <div className="col-8">
          {Object.values(CommandUsageTypes).map((commandUsageType) => {
            return <PermissionSettingsForEachCommandTypeComponent key={commandUsageType} usageType={commandUsageType} />;
          })}
        </div>
      </div>

      <p className="mb-4 font-weight-bold">Events</p>
      <div className="row d-flex flex-column align-items-center">
        <div className="col-8">
          {Object.values(EventTypes).map((EventTypes) => {
            return <PermissionSettingsForEachCommandTypeComponent key={EventTypes} usageType={EventTypes} />;
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
  permissionsForSlackEventActions: PropTypes.object.isRequired,
};

export default ManageCommandsProcess;
