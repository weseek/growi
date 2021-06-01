import path from 'path';
import NextI18Next from 'next-i18next';

const nextI18Next = new NextI18Next({
  defaultLanguage: 'en_US',
  otherLanguages: ['ja_JP', 'zh_CN'],
  defaultNS: 'translation',
  localePath: path.resolve('./public/static/locales'),
  shallowRender: true,
  // TODO: GW-3581
  // In master, uses alias to detect the browser setting language for the guest user .
  // detection: {
  //   order: ['cookie', 'header', 'querystring'],
  // },
  // // react i18next special options (optional)
  // react: {
  //   wait: false,
  //   withRef: true,
  //   bindI18n: 'languageChanged loaded',
  //   bindStore: 'added removed',
  //   nsMode: 'default',
  // },
});

if (process.env.NODE_ENV !== 'production') {
  import('i18next-hmr').then((i18nextHmr) => {
    i18nextHmr.applyClientHMR(nextI18Next.i18n);
  });
}

export default nextI18Next;
// export all fields manually because of the difference to `module.exports`
export const Trans = nextI18Next.Trans;
export const Link = nextI18Next.Link;
export const Router = nextI18Next.Router;
export const i18n = nextI18Next.i18n;
export const config = nextI18Next.config;
export const appWithTranslation = nextI18Next.appWithTranslation;
export const withTranslation = nextI18Next.withTranslation;
export const useTranslation = nextI18Next.useTranslation;
