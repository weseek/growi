import { getSupportedGrowiActionsRegExp, IChannelOptionalId, permissionParser } from '@growi/slack';

type CommandPermission = { [key:string]: string[] | boolean }

export const checkPermission = (
    commandPermission: CommandPermission, commandOrActionIdOrCallbackId: string, fromChannel: IChannelOptionalId,
): boolean => {

  // help
  if (commandOrActionIdOrCallbackId === 'help') {
    return true;
  }

  Object.entries(commandPermission).forEach((entry) => {
    const [command, value] = entry;
    const permission = value;
    const commandRegExp = getSupportedGrowiActionsRegExp(command);
    if (!commandRegExp.test(commandOrActionIdOrCallbackId)) return;

    return permissionParser(permission, fromChannel);
  });

  return false;
};
