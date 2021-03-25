import { SlashCommand } from '@slack/bolt';
import { InvalidGrowiCommandError } from '~/models/errors';

import { parse } from './slash-command-parser';

const SlashCommandMock = jest.fn<SlashCommand, [string]>().mockImplementation((text) => {
  return { text } as SlashCommand;
});

describe('parse SlashCommand', () => {

  describe('without growiCommandType', () => {
    test('throws InvalidGrowiCommandError', () => {
      // setup
      const slashCommandText = '/growi';
      const slashCommand = new SlashCommandMock(slashCommandText);

      // when/then
      expect(() => {
        parse(slashCommand);
      }).toThrowError(InvalidGrowiCommandError);
    });
  });

  test('returns a GrowiCommand instance with empty growiCommandArgs', () => {
    // setup
    const slashCommandText = '/growi search';
    const slashCommand = new SlashCommandMock(slashCommandText);

    // when
    const result = parse(slashCommand);

    // then
    expect(result.text).toBe(slashCommandText);
    expect(result.growiCommandType).toBe('search');
    expect(result.growiCommandArgs).toStrictEqual([]);
  });

  test('returns a GrowiCommand instance', () => {
    // setup
    const slashCommandText = '/growi search keyword1 keyword2';
    const slashCommand = new SlashCommandMock(slashCommandText);

    // when
    const result = parse(slashCommand);

    // then
    expect(result.text).toBe(slashCommandText);
    expect(result.growiCommandType).toBe('search');
    expect(result.growiCommandArgs).toStrictEqual(['keyword1', 'keyword2']);
  });
});
