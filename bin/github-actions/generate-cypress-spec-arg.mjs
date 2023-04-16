/* eslint-disable no-console */

/*
 * USAGE:
 *  node generate-cypress-spec-arg --prefix=${prefix} --suffix=${suffix} ${value}
 *
 * OPTIONS:
 *  --prefix : prefix string for each items
 *  --suffix : suffix string for each items
 *
 * EXAMPLE:
 *  node generate-cypress-spec-arg --prefix=${prefix}"A" --suffix="Z" "1,3,5"
 *  => A1Z,A3Z,A5Z
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;


const printExample = () => {
  console.group('** Usage **');
  // eslint-disable-next-line no-template-curly-in-string
  console.log('$ node generate-cypress-spec-arg --prefix=${prefix}"A" --suffix="Z" "1,3,5"');
  console.log('  ==> A1Z,A3Z,A5Z');
  console.groupEnd();
  console.log('\n');
};


const { prefix, suffix, _: value } = argv;

if (prefix == null) {
  printExample();
  throw new Error('The option "prefix" must be specified');
}
if (suffix == null) {
  printExample();
  throw new Error('The option "suffix" must be specified');
}
if (value.length === 0) {
  printExample();
  throw new Error('A value string must be specified');
}

const result = value[0]
  .toString().split(',')
  .map(v => v.trim())
  .map(v => `${prefix}${v}${suffix}`)
  .join(',');

console.log(result);
