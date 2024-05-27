import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';


export const useIsUntitledPage = (currentPage?: IPagePopulatedToShowRevision | null, editedPageTitle?: string): boolean => {

  const { t, i18n } = useTranslation();

  // const { t: tJa } = useTranslation('translation', { lng: 'ja_JP' });
  // const { t: tEn } = useTranslation('translation', { lng: 'en_US' });
  // const { t: tZh } = useTranslation('translation', { lng: 'zh_CN' });

  if (currentPage == null || editedPageTitle == null) {
    return false;
  }

  const currentLanguage = i18n.language;

  // const getTranslation = (lng: string, key: string) => {
  //   i18n.changeLanguage(lng);
  //   return t(key);
  // };

  // const isUntitledPageTitle = false;

  const languageArray = ['ja_JP', 'en_US', 'zh_CN'];

  const determineIsUntitledPageTitle = (languageArray, editedPageTitle) => {
    return languageArray.some((lng) => {
      const untitledPageTitle = i18n.getFixedT(lng, 'translation')('create_page.untitled');

      console.log(untitledPageTitle);

      // https://regex101.com/r/Wg2Hh6/1
      const untitledPageRegex = new RegExp(`^${untitledPageTitle}-\\d+$`);

      console.log(untitledPageRegex.test(editedPageTitle));

      return untitledPageRegex.test(editedPageTitle);
    });
  };

  const isUntitledPageTitle = determineIsUntitledPageTitle(languageArray, editedPageTitle);


  // languageArray.forEach((lng) => {
  //   const untitledPageTitle = i18n.getFixedT(lng, 'translation')('create_page.untitled');

  //   // https://regex101.com/r/Wg2Hh6/1
  //   const untitledPageRegex = new RegExp(`^${untitledPageTitle}-\\d+$`);

  //   if (untitledPageRegex.test(editedPageTitle)) isUntitledPageTitle = true;
  // });

  // const jaUntitledPageTitle = i18n.getFixedT('ja_JP', 'translation')('create_page.untitled');
  // const enUntitledPageTitle = i18n.getFixedT('en_US', 'translation')('create_page.untitled');
  // const zhUntitledPageTitle = i18n.getFixedT('zh_CN', 'translation')('create_page.untitled');


  // const jaUntitledPageTitle = tJa('create_page.untitled');
  // const enUntitledPageTitle = tEn('create_page.untitled');
  // const zhUntitledPageTitle = tZh('create_page.untitled');

  // const untitled = t('create_page.untitled');

  // const jaHelp = tJa('Help');
  // const enHelp = tEn('Help');
  // const zhHelp = tZh('Help');

  // const help = t('Help');

  // https://regex101.com/r/Wg2Hh6/1
  // const untitledPageTitle = t('create_page.untitled');
  // const untitledPageRegex = new RegExp(`^${untitledPageTitle}-\\d+$`);

  const isNewlyCreatedPage = (currentPage.wip && currentPage.latestRevision == null && isUntitledPageTitle) ?? false;

  return isNewlyCreatedPage;

};

// let isUntitledPageTitle = false;
//   const enUntitledPageTitle = t('create_page.untitled', { lng: 'en' });
//   const jaUntitledPageTitle = t('create_page.untitled', { lng: 'ja' });
//   const zhUntitledPageTitle = t('create_page.untitled', { lng: 'zh' });

//   // const untitledPageRegex = new RegExp(`^${untitledPageTitle}-\\d+$`);

//   const languageArray = ['ja', 'en', 'zh'];

//   languageArray.forEach((lng) => {
//     const untitledPageTitle = t('create_page.untitled', { lng });

//     // https://regex101.com/r/Wg2Hh6/1
//     const untitledPageRegex = new RegExp(`^${untitledPageTitle}-\\d+$`);

//     if (untitledPageRegex.test(editedPageTitle)) isUntitledPageTitle = true;
//   });

//   console.log(currentPage.wip);
//   console.log(currentPage.latestRevision == null);
//   console.log(isUntitledPageTitle);
