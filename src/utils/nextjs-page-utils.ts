import { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { CrowiRequest } from '~/interfaces/crowi-request';
import DevidedPagePath from '~/models/devided-page-path';

export type CommonProps = {
  namespacesRequired: string[], // i18next
  currentPagePath: string,
  appTitle: string,
  confidential: string,
  customTitleTemplate: string,
  growiVersion: string,
}

// eslint-disable-next-line max-len
export const getServerSideCommonProps: GetServerSideProps<CommonProps> = async(context: GetServerSidePropsContext) => {

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, customizeService,
  } = crowi;

  const url = new URL(context.resolvedUrl, 'http://example.com');
  const currentPagePath = decodeURI(url.pathname);

  const props: CommonProps = {
    namespacesRequired: ['translation'],
    currentPagePath,
    appTitle: appService.getAppTitle(),
    confidential: appService.getAppConfidential() || '',
    customTitleTemplate: customizeService.customTitleTemplate,
    growiVersion: crowi.version,
  };

  return { props };
};

/**
 * Generate whole title string for the specified title
 * @param props
 * @param title
 */
export const useCustomTitle = (props: CommonProps, title: string): string => {
  return props.customTitleTemplate
    .replace('{{sitename}}', props.appTitle)
    .replace('{{page}}', title)
    .replace('{{pagepath}}', title)
    .replace('{{pagename}}', title);
};

/**
 * Generate whole title string for the specified page path
 * @param props
 * @param pagePath
 */
export const useCustomTitleForPage = (props: CommonProps, pagePath: string): string => {
  const dPagePath = new DevidedPagePath(pagePath, true, true);

  return props.customTitleTemplate
    .replace('{{sitename}}', props.appTitle)
    .replace('{{pagepath}}', pagePath)
    .replace('{{page}}', dPagePath.latter) // for backward compatibility
    .replace('{{pagename}}', dPagePath.latter);
};
