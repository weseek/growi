import useSWR, { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';
import { apiv3Get } from '~/client/util/apiv3-client';
import { usePageId, useTemplateTagData, useShareLinkId } from '~/stores/context';
import { GetPageTagResponse } from '~/interfaces/tag';


export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return (
    useStaticSWR('isSlackEnabled', isEnabled || null, { fallbackData: initialData })
  );
};

export const usePageTags = (): SWRResponse<string[] | undefined, Error> => {
  const { data: pageId } = usePageId();
  const { data: templateTagData } = useTemplateTagData();
  const { data: shareLinkId } = useShareLinkId();

  const fetcher = async(endpoint: string) => {
    if (shareLinkId != null) {
      return;
    }

    let tags: string[] = [];
    // when the page exists or is a shared page
    if (pageId != null && shareLinkId == null) {
      const res = await apiv3Get<GetPageTagResponse>(endpoint, { pageId });
      tags = res.data.tags;
    }
    // when the page does not exist
    else if (templateTagData != null) {
      tags = templateTagData.split(',').filter((str: string) => {
        return str !== ''; // filter empty values
      });
    }

    return tags;
  };

  return useSWR(['/pages.getPageTag', pageId], fetcher);

};
