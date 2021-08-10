export const getSupportedGrowiActionsRegExps = (supportedGrowiCommands: string[]): RegExp[] => {
  return supportedGrowiCommands.map(command => new RegExp(`^${command}:\\w+`));
};
