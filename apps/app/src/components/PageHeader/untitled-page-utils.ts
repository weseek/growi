import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';


export const useIsUntitledPage = (currentPage?: IPagePopulatedToShowRevision | null, editedPageTitle?: string): boolean => {

  const { t } = useTranslation();

  if (currentPage == null || editedPageTitle == null) {
    return false;
  }

  // https://regex101.com/r/Wg2Hh6/1
  const untitledPageTitle = t('create_page.untitled');
  const untitledPageRegex = new RegExp(`^${untitledPageTitle}-\\d+$`);

  const isNewlyCreatedPage = (currentPage.wip && currentPage.latestRevision == null && untitledPageRegex.test(editedPageTitle)) ?? false;

  return isNewlyCreatedPage;

};
