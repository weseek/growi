import path from 'path';

import type { Lang } from '@growi/core';
import type { TFunction, i18n } from 'i18next';
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

import { defaultLang, initOptions } from '^/config/i18next.config';

import { resolveFromRoot } from '~/utils/project-dir-utils';

import { configManager } from './config-manager';


const relativePathToLocalesRoot = path.relative(__dirname, resolveFromRoot('public/static/locales'));

const initI18next = async(fallbackLng: Lang[] = [defaultLang]) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(
      resourcesToBackend(
        (language: string, namespace: string) => {
          return import(path.join(relativePathToLocalesRoot, language, `${namespace}.json`));
        },
      ),
    )
    .init({
      ...initOptions,
      fallbackLng,
    });
  return i18nInstance;
};

type Translation = {
  t: TFunction,
  i18n: i18n
}

export async function getTranslation(lang?: Lang): Promise<Translation> {
  const globalLang = configManager.getConfig('crowi', 'app:globalLang') as Lang;
  const fixedLang = lang ?? globalLang;
  const i18nextInstance = await initI18next([fixedLang, defaultLang]);

  return {
    t: i18nextInstance.getFixedT(fixedLang),
    i18n: i18nextInstance,
  };
}
