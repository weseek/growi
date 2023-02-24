import platformPath from 'node:path';

import { isTopPage } from './is-top-page';

/**
 * returns ancestors paths
 * @param {string} path
 * @param {string[]} ancestorPaths
 * @returns {string[]}
 */
export const collectAncestorPaths = (path: string, ancestorPaths: string[] = []): string[] => {
  if (isTopPage(path)) return ancestorPaths;

  const parentPath = platformPath.dirname(path);
  ancestorPaths.push(parentPath);
  return collectAncestorPaths(parentPath, ancestorPaths);
};
