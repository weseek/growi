import { checkTemplatePath } from './template-checker';

/**
 * Returns Whether to create pages with the wip flag
 * @param {string} path
 * @returns {boolean}
 */
export const shouldCreateWipPage = (path?: string): boolean => {
  if (path == null) {
    return true;
  }

  return !(checkTemplatePath(path) || path === '/Sidebar');
};
