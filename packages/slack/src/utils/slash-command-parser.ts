import { GrowiCommand } from '../interfaces/growi-command';
import { InvalidGrowiCommandError } from '../models/errors';

export const parseSlashCommand = (slashCommand:{[key:string]:string}): GrowiCommand => {
  const trimmedText = slashCommand.text.trim();
  const splitted = trimmedText.split(' ');

  if (splitted[0] === '') {
    throw new InvalidGrowiCommandError('The SlashCommand.text does not specify GrowiCommand type');
  }

  return {
    text: slashCommand.text,
    growiCommandType: splitted[0],
    growiCommandArgs: splitted.slice(1),
  };
};
