import { getSupportedGrowiActionsRegExp, IChannel } from '@growi/slack';

type CommandPermission = { [key:string]: string[] | boolean }

export const checkPermission = (
    commandPermission: CommandPermission, commandOrActionIdOrCallbackId: string, fromChannel: IChannel,
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

    const fromChannelIdOrName = fromChannel.id || fromChannel.name;
    if (Array.isArray(permission) && permission.includes(fromChannelIdOrName)) {
      isPermitted = true;
      return;
    }
  });

  return isPermitted;
};
