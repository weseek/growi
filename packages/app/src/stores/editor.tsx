import { SWRResponse } from 'swr';
import { GetPageTagResponse } from '~/interfaces/tag';
import { usePageTags } from '~/stores/page';
import { useStaticSWR } from './use-static-swr';


export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return (
    useStaticSWR('isSlackEnabled', isEnabled || null, { fallbackData: initialData })
  );
};

export const useStaticPageTags = (): SWRResponse<GetPageTagResponse['tags'], Error> => {
  const { data: pageId } = usePageTags();
  return useStaticSWR<GetPageTagResponse['tags'], Error>('pageTags', pageId || []);
};
