import useSWR, { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';
import { apiv3Get } from '~/client/util/apiv3-client';
import { usePageId, useTemplateTagData, useShareLinkId } from '~/stores/context';
import { GetPageTagResponse } from '~/interfaces/tag';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:services:TagContainer');


export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return (
    useStaticSWR('isSlackEnabled', isEnabled || null, { fallbackData: initialData })
  );
};

export const usePageTags = (pageTags?: string[]): SWRResponse<string[] | void, Error> | undefined => {
  const { data: pageId } = usePageId();
  const { data: templateTagData } = useTemplateTagData();
  const { data: shareLinkId } = useShareLinkId();


  if (shareLinkId != null) {
    return;
  }

  let tags: string[] = [];
  // when the page exists or shared page
  if (pageId != null && shareLinkId == null) {
    return useSWR(
      '/pages.getPageTag',
      endpoint => apiv3Get<GetPageTagResponse>(endpoint).then((res) => { tags = res.data.tags }),
    );
  }
  // when the page not exist
  if (templateTagData != null) {
    tags = templateTagData.split(',').filter((str) => {
      return str !== ''; // filter empty values
    });
  }

  logger.debug('tags data has been initialized');

  pageContainer.setState({ tags });
  editorContainer.setState({ tags });

};
