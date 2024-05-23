import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';


export const useIsUntitledPage = (currentPage?: IPagePopulatedToShowRevision | null, editedPageTitle?: string): boolean => {

  // const { t, i18n } = useTranslation();

  const { t: tEn } = useTranslation('translation', { lng: 'en' });
  const { t: tJa } = useTranslation('translation', { lng: 'ja' });
  const { t: tZh } = useTranslation('translation', { lng: 'zh' });

  if (currentPage == null || editedPageTitle == null) {
    return false;
  }

  const isUntitledPageTitle = false;

  const languageArray = ['ja', 'en', 'zh'];

  // languageArray.forEach((lng) => {
  //   const untitledPageTitle = i18n.getFixedT(lng)('create_page.untitled');

  //   // https://regex101.com/r/Wg2Hh6/1
  //   const untitledPageRegex = new RegExp(`^${untitledPageTitle}-\\d+$`);

  //   if (untitledPageRegex.test(editedPageTitle)) isUntitledPageTitle = true;
  // });

  const jaUntitledPageTitle = tJa('create_page.untitled');
  const enUntitledPageTitle = tEn('create_page.untitled');
  const zhUntitledPageTitle = tZh('create_page.untitled');

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
