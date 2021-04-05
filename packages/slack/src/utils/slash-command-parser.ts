import { SlashCommand } from '@slack/bolt';

import { GrowiCommand } from '../interfaces/growi-command';
import { InvalidGrowiCommandError } from '../models/errors';

export const parse = (slashCommand: SlashCommand): GrowiCommand => {
  console.log(slashCommand);
  const splitted = slashCommand.command.split(' ');
  if (splitted.length < 1) {
    throw new InvalidGrowiCommandError('The SlashCommand.text does not specify GrowiCommand type');
  }

  return {
    text: slashCommand.text,
    growiCommandType: 'hoge',
    growiCommandArgs: ['fugo'],
  };
};
