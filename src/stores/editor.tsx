import { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';

export const useIndentSize = (initialData?: any): SWRResponse<any, any> => {
  return useStaticSWR('indentSize', initialData)
}
