import { SlashCommand } from '@slack/bolt';

import { GrowiCommand } from '~/interfaces/growi-command';
import { InvalidGrowiCommandError } from '~/models/errors';

export const parse = (slashCommand: SlashCommand): GrowiCommand => {
  const splitted = slashCommand.text.split(' ');

  if (splitted.length < 2) {
    throw new InvalidGrowiCommandError('The SlashCommand.text does not specify GrowiCommand type');
  }

  return {
    text: slashCommand.text,
    growiCommandType: splitted[1],
    growiCommandArgs: splitted.slice(2),
  };
};
