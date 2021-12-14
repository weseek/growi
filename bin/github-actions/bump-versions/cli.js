import { print, parseArgs } from 'shipjs/src/util';
import bumpVersions from './flow/bump-versions';

export async function cli(argv) {
  const { fn, arg: argSpec } = bumpVersions;
  try {
    const opts = parseArgs(argSpec, argv);
    await fn(opts);
  }
  catch (error) {
    if (error.code === 'ARG_UNKNOWN_OPTION') {
      print(error);
    }
    else {
      throw error;
    }
  }
}
