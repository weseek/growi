/* eslint-disable import/prefer-default-export */

import path from 'path';

export const projectRoot: string = path.resolve(__dirname, '../../');

export function resolveFromRoot(relativePath: string): string {
  return path.resolve(projectRoot, relativePath);
}
