import { DevidedPagePath } from '@growi/core/dist/models';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';

export type PageTitleCustomizationProps = {
  appTitle: string,
  customTitleTemplate: string,
};

export const getServerSidePageTitleCustomizationProps: GetServerSideProps<PageTitleCustomizationProps> = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, customizeService,
  } = crowi;

  return {
    props: {
      appTitle: appService.getAppTitle(),
      customTitleTemplate: customizeService.customTitleTemplate,
    },
  };
};

/**
 * Generate whole title string for the specified title
 * @param props
 * @param title
 */
export const generateCustomTitle = (props: PageTitleCustomizationProps, title: string): string => {
  return props.customTitleTemplate
    .replace('{{sitename}}', props.appTitle)
    .replace('{{pagepath}}', title)
    .replace('{{pagename}}', title);
};

/**
 * Generate whole title string for the specified page path
 * @param props
 * @param pagePath
 */
export const generateCustomTitleForPage = (props: PageTitleCustomizationProps, pagePath: string): string => {
  const dPagePath = new DevidedPagePath(pagePath, true, true);

  return props.customTitleTemplate
    .replace('{{sitename}}', props.appTitle)
    .replace('{{pagepath}}', pagePath)
    .replace('{{pagename}}', dPagePath.latter);
};
