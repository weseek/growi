import React, { useCallback, useEffect, useState } from 'react';
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

const defaultCommandsName = [...defaultSupportedCommandsNameForBroadcastUse, ...defaultSupportedCommandsNameForSingleUse];


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


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const ManageCommandsProcessWithoutProxy = ({ apiv3Put, commandPermission }) => {
  const { t } = useTranslation();
  const [editingCommandPermission, setEditingCommandPermission] = useState({});

  const updatePermissionsCommandsState = useCallback((e) => {
    const { target } = e;
    const { name: commandName, value } = target;

    // update state
    setEditingCommandPermission(prev => getUpdatedPermissionSettings(prev, commandName, value));
  }, []);


  useEffect(() => {
    setEditingCommandPermission(() => {
      const updatedState = {};
      if (commandPermission != null) {
        Object.entries(commandPermission).forEach((entry) => {
          const [command, value] = entry;
          updatedState[command] = value;
        });
      }
      return updatedState;
    });
  }, [commandPermission]);

  const updateChannelsListState = useCallback((e) => {
    const { target } = e;
    const { name: commandName, value } = target;
    // update state
    setEditingCommandPermission(prev => getUpdatedChannelsList(prev, commandName, value));
  }, []);


  const updateCommandsHandler = async(e) => {
    try {
      await apiv3Put('/slack-integration-settings/without-proxy/update-permissions', {
        commandPermission: editingCommandPermission,
      });
      toastSuccess(t('toaster.update_successed', { target: 'Token' }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };

  const PermissionSettingForEachCommandComponent = ({ commandName }) => {

    if (editingCommandPermission == null) {
      return null;
    }

    const hiddenClass = Array.isArray(editingCommandPermission[commandName]) ? '' : 'd-none';
    const permission = editingCommandPermission[commandName];
    const textareaDefaultValue = Array.isArray(permission) ? permission.join(',') : '';

    return (
      <div className="my-1 mb-2">
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
                {editingCommandPermission[commandName] === true && t('admin:slack_integration.accordion.allow_all')}
                {editingCommandPermission[commandName] === false && t('admin:slack_integration.accordion.deny_all')}
                {Array.isArray(editingCommandPermission[commandName]) && t('admin:slack_integration.accordion.allow_specified')}
              </span>
            </button>
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                type="button"
                name={commandName}
                value={PermissionTypes.ALLOW_ALL}
                onClick={updatePermissionsCommandsState}
              >
                {t('admin:slack_integration.accordion.allow_all_long')}
              </button>
              <button
                className="dropdown-item"
                type="button"
                name={commandName}
                value={PermissionTypes.DENY_ALL}
                onClick={updatePermissionsCommandsState}
              >
                {t('admin:slack_integration.accordion.deny_all_long')}
              </button>
              <button
                className="dropdown-item"
                type="button"
                name={commandName}
                value={PermissionTypes.ALLOW_SPECIFIED}
                onClick={updatePermissionsCommandsState}
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
            onChange={updateChannelsListState}
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


  return (
    <div className="py-4 px-5">
      <p className="mb-4 font-weight-bold">{t('admin:slack_integration.accordion.manage_commands')}</p>
      <div className="row d-flex flex-column align-items-center">

        <div className="col-8">
          <div className="custom-control custom-checkbox">
            <div className="row mb-5 d-block">
              {defaultCommandsName.map((commandName) => {
                // eslint-disable-next-line max-len
                return <PermissionSettingForEachCommandComponent key={`${commandName}-component`} commandName={commandName} />;
              })}
            </div>
          </div>
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

ManageCommandsProcessWithoutProxy.propTypes = {
  apiv3Put: PropTypes.func,
  commandPermission: PropTypes.object,

};

export default ManageCommandsProcessWithoutProxy;
