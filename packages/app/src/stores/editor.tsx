import { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';

export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  const initialData = false;
  return (
    useStaticSWR('isSlackEnabled', isEnabled || null, { fallbackData: initialData })
  );
};

export const usePageTags = (tags?: string[]): SWRResponse<string[], Error> => {
  const initialData = [];
  return (
    useStaticSWR('selectedTags', tags || null, { fallbackData: initialData })
  );
};
