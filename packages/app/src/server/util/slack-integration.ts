import { getSupportedGrowiActionsRegExp } from '@growi/slack';

type CommandPermission = { [key:string]: string[] | boolean }

export const checkPermission = (
    commandPermission:CommandPermission, commandOrActionIdOrCallbackId:string, fromChannel:string,
):boolean => {
  let isPermitted = false;

  // help
  if (commandOrActionIdOrCallbackId === 'help') {
    return true;
  }

  Object.entries(commandPermission).forEach((entry) => {
    const [command, value] = entry;
    const permission = value;
    const commandRegExp = getSupportedGrowiActionsRegExp(command);
    if (!commandRegExp.test(commandOrActionIdOrCallbackId)) return;

    // permission check
    if (permission === true) {
      isPermitted = true;
      return;
    }
    if (Array.isArray(permission) && permission.includes(fromChannel)) {
      isPermitted = true;
      return;
    }
  });

  return isPermitted;
};
