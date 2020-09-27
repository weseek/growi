import { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { CrowiRequest } from '~/interfaces/crowi-request';
import DevidedPagePath from '~/models/devided-page-path';

export type CommonProps = {
  appTitle: string,
  customTitleTemplate: string,
}

// eslint-disable-next-line max-len
export const getServerSideCommonProps: GetServerSideProps<CommonProps> = async(context: GetServerSidePropsContext) => {

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, customizeService,
  } = crowi;

  const props: CommonProps = {
    appTitle: appService.getAppTitle(),
    customTitleTemplate: customizeService.customTitleTemplate,
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
