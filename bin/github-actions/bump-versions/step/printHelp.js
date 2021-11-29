import runStep from 'shipjs/src/step/runStep';
import { print } from 'shipjs/src/util';
import { bold, underline } from 'shipjs/src/color';

export default () => runStep({}, () => {
  const indent = line => `\t${line}`;

  const help = '--help';
  const dir = `--dir ${underline('PATH')}`;
  const increment = `--increment ${underline('LEVEL')}`;
  const preId = `--preid ${underline('IDENTIFIER')}`;
  const updateDependencies = `--update-dependencies ${underline('true/false')}`;
  const dryRun = '--dry-run';
  const all = [help, dir, increment, preId, updateDependencies, dryRun]
    .map(x => `[${x}]`)
    .join(' ');

  const messages = [
    bold('NAME'),
    indent('bump-versions - Bump versions of packages.'),
    '',
    bold('USAGE'),
    indent(`node ./bin/github-actions/bump-versions ${all}`),
    '',
    bold('OPTIONS'),
    indent(`-h, ${help}`),
    indent('  Print this help'),
    '',
    indent(`-d, ${dir}`),
    indent(
      `  Specify the ${underline(
        'PATH',
      )} of the repository (default: the current directory).`,
    ),
    '',
    indent(`-i, ${increment}`),
    indent(
      `  Specify the ${underline(
        'LEVEL',
      )} for semver.inc() to increment a version (default: 'patch').`,
    ),
    '',
    indent(`${preId}`),
    indent(
      `  Specify the ${underline(
        'IDENTIFIER',
      )} for semver.inc() with 'prerelease' type (default: 'RC').`,
    ),
    '',
    indent(`${updateDependencies}`),
    indent('  Update dependencies or not (default: true).'),
    '',
    indent(`-D, ${dryRun}`),
    indent('  Displays the steps without actually doing them.'),
    '',
  ];
  print(messages.join('\n'));
});
