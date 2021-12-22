import useSWR, { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';
import { apiv3Get } from '~/client/util/apiv3-client';
import { usePageId, useTemplateTagData, useShareLinkId } from '~/stores/context';
import { IPage } from '~/interfaces/page';
import { HasObjectId } from '~/interfaces/has-object-id';


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
    return [];
  }

  let tags = [];
  // when the page exists or shared page
  if (pageId != null && shareLinkId == null) {
    return useSWR(
      '/pages.getPageTag',
      endpoint => apiv3Get<{ pages:(IPage & HasObjectId)[] }>(endpoint).then((res) => { tags = res.tags }),
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
