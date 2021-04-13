import { SlashCommand } from '@slack/bolt';
import { InvalidGrowiCommandError } from '../models/errors';

import { parseSlashCommand } from './slash-command-parser';

const SlashCommandMock = jest.fn<SlashCommand, [string]>().mockImplementation((text) => {
  return { text } as SlashCommand;
});

describe('parseSlashCommand', () => {

  describe('without growiCommandType', () => {
    test('throws InvalidGrowiCommandError', () => {
      // setup
      const slashCommandText = '';
      const slashCommand = new SlashCommandMock(slashCommandText);

      // when/then
      expect(() => {
        parseSlashCommand(slashCommand);
      }).toThrowError(InvalidGrowiCommandError);
    });
  });

  test('returns a GrowiCommand instance with empty growiCommandArgs', () => {
    // setup
    const slashCommandText = 'search';
    const slashCommand = new SlashCommandMock(slashCommandText);

    // when
    const result = parseSlashCommand(slashCommand);

    // then
    expect(result.text).toBe(slashCommandText);
    expect(result.growiCommandType).toBe('search');
    expect(result.growiCommandArgs).toStrictEqual([]);
  });

  test('returns a GrowiCommand instance with space growiCommandType', () => {
    // setup
    const slashCommandText = '   search   ';
    const slashCommand = new SlashCommandMock(slashCommandText);

    // when
    const result = parseSlashCommand(slashCommand);

    // then
    expect(result.text).toBe(slashCommandText);
    expect(result.growiCommandType).toBe('search');
    expect(result.growiCommandArgs).toStrictEqual([]);
  });

  test('returns a GrowiCommand instance with space growiCommandArgs', () => {
    // setup
    const slashCommandText = '   search hoge   ';
    const slashCommand = new SlashCommandMock(slashCommandText);

    // when
    const result = parseSlashCommand(slashCommand);

    // then
    expect(result.text).toBe(slashCommandText);
    expect(result.growiCommandType).toBe('search');
    expect(result.growiCommandArgs).toStrictEqual(['hoge']);
  });

  test('returns a GrowiCommand instance', () => {
    // setup
    const slashCommandText = 'search keyword1 keyword2';
    const slashCommand = new SlashCommandMock(slashCommandText);

    // when
    const result = parseSlashCommand(slashCommand);

    // then
    expect(result.text).toBe(slashCommandText);
    expect(result.growiCommandType).toBe('search');
    expect(result.growiCommandArgs).toStrictEqual(['keyword1', 'keyword2']);
  });
});
