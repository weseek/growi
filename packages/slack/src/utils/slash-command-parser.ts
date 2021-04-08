import { GrowiCommand } from '../interfaces/growi-command';
import { InvalidGrowiCommandError } from '../models/errors';

export const parse = (slashCommand:{[key:string]:string}): GrowiCommand => {
  const splitted = slashCommand.text.split(' ');
  console.log('slash-command', splitted);

  if (splitted[0] === '') {
    throw new InvalidGrowiCommandError('The SlashCommand.text does not specify GrowiCommand type');
  }

  return {
    text: slashCommand.text,
    growiCommandType: splitted[0],
    growiCommandArgs: splitted.slice(1),
  };
};
