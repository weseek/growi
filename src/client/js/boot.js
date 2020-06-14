import loggerFactory from '@alias/logger';
import Xss from '@commons/service/xss';

import {
  mediaQueryListForDarkMode,
  applyColorScheme,
} from './util/color-scheme';

const logger = loggerFactory('growi:cli:bootstrap');

if (!window) {
  window = {};
}

// setup xss library
const xss = new Xss();
window.xss = xss;

logger.debug('Dark Mode:', mediaQueryListForDarkMode.matches);

applyColorScheme();
