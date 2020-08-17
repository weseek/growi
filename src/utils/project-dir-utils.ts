/* eslint-disable import/prefer-default-export */

import fs from 'fs';
import path from 'path';

const isCurrentDirRoot = fs.existsSync('./next.config.js');

export const projectRoot = isCurrentDirRoot
  ? process.cwd()
  : path.resolve(__dirname, '../../');

export function resolveFromRoot(relativePath: string): string {
  return path.resolve(projectRoot, relativePath);
}
