import path from 'path';
import NextI18Next from 'next-i18next';

// import { listLocaleIds } from './utils/locale-utils';
// import { resolveFromRoot } from './utils/project-dir-utils';

const nextI18Next = new NextI18Next({
  defaultLanguage: 'en_US',
  // otherLanguages: listLocaleIds().filter(id => id !== 'en_US'),
  otherLanguages: ['ja_JP'],
  defaultNS: 'translation',
  // localePath: resolveFromRoot('resource/locales'),
  localePath: path.resolve('./resource/locales'),
  shallowRender: true,
});

export default nextI18Next;
module.exports = nextI18Next;
