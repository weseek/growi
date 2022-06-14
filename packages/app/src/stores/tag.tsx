import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';


import { apiGet } from '~/client/util/apiv1-client';
import { IResGetPageTags, IListTagNamesByPage, IResTagsListApiv1 } from '~/interfaces/tag';
import { useCurrentPageId, useTemplateTagData, useShareLinkId } from '~/stores/context';
import { useSWRxTagsInfo } from '~/stores/page';


export const useSWRxTagsList = (limit?: number, offset?: number): SWRResponse<IResTagsListApiv1, Error> => {
  return useSWRImmutable(
    ['/tags.list', limit, offset],
    (endpoint, limit, offset) => apiGet(endpoint, { limit, offset }).then((result: IResTagsListApiv1) => result),
  );
};


export const useSWRxPageTags = (): SWRResponse<IListTagNamesByPage | undefined, Error> => {
  const { data: pageId } = useCurrentPageId();
  const { data: tagsInfoData } = useSWRxTagsInfo(pageId);
  const { data: templateTagData } = useTemplateTagData();
  const { data: shareLinkId } = useShareLinkId();

  const fetcher = async(endpoint: string) => {
    if (shareLinkId != null) {
      return;
    }

    let tags: string[] = [];
    // when the page exists or is a shared page
    if (tagsInfoData != null && pageId != null && shareLinkId == null) {
      tags = tagsInfoData.tags;
    }
    // when the page does not exist
    else if (templateTagData != null) {
      tags = templateTagData.split(',').filter((str: string) => {
        return str !== ''; // filter empty values
      });
    }

    console.log('tags_useSWRxPageTags', tags);

    return tags;
  };

  return useSWR('/pages.getPageTag', fetcher);
};
