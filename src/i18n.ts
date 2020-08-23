import path from 'path';
import NextI18Next from 'next-i18next';

// setup LanguageDetector for server
/* eslint-disable @typescript-eslint/no-unused-vars */
// const userSettingDetector = {
//   name: 'userSettingDetector',
//   lookup(req: any, res: any, options: any) {
//     console.log(req);

//     if (req?.user == null) {
//       return null;
//     }
//     return req.user.lang || null;
//   },
//   cacheUserlanguage(req: any, res: any, lng: string, options: any) {
//     // nothing to do
//   },
// };
/* eslint-enable @typescript-eslint/no-unused-vars */

const nextI18Next = new NextI18Next({
  defaultLanguage: 'en_US',
  otherLanguages: ['ja_JP', 'zh_CN'],
  defaultNS: 'translation',
  localePath: path.resolve('./resource/locales'),
  shallowRender: true,
  // customDetectors: [userSettingDetector],
  // detection: {
  //   order: ['userSettingDetector', 'cookie', 'header', 'querystring'],
  // },
});

export default nextI18Next;
// export all fields manually because of the difference to `module.exports`
export const Trans = nextI18Next.Trans;
export const Link = nextI18Next.Link;
export const Router = nextI18Next.Router;
export const config = nextI18Next.config;
export const appWithTranslation = nextI18Next.appWithTranslation;
export const withTranslation = nextI18Next.withTranslation;
export const useTranslation = nextI18Next.useTranslation;
