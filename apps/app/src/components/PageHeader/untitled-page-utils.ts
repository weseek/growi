import type { IPagePopulatedToShowRevision } from '@growi/core';
import { AllLang } from '@growi/core';
import { useTranslation } from 'next-i18next';


export const useIsUntitledPage = (currentPage?: IPagePopulatedToShowRevision | null, editedPageTitle?: string): boolean => {

  const { i18n } = useTranslation();

  if (currentPage == null || editedPageTitle == null) {
    return false;
  }

  const determineIsUntitledPageTitle = () => {
    return AllLang.some((lng) => {
      const untitledPageTitle = i18n.getFixedT(lng, 'translation')('create_page.untitled');

      // https://regex101.com/r/Wg2Hh6/1
      const untitledPageRegex = new RegExp(`^${untitledPageTitle}-\\d+$`);

      return untitledPageRegex.test(editedPageTitle);
    });
  };

  const isUntitledPageTitle = determineIsUntitledPageTitle();

  const isNewlyCreatedPage = (currentPage.wip && currentPage.latestRevision == null && isUntitledPageTitle) ?? false;

  return isNewlyCreatedPage;

};
