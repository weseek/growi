import { useSWRStatic } from '@growi/core/dist/swr';
import { SWRResponse } from 'swr';

import Linker from '@growi/editor/src/services/link-util/Linker';

type LinkEditModalStatus = {
  isOpened: boolean,
  defaultMarkdownLink?: Linker,
  onSave?: (linkText: string) => void
}

type LinkEditModalUtils = {
  open(defaultMarkdownLink: Linker, onSave: (linkText: string) => void): void,
  close(): void,
}

export const useLinkEditModal = (): SWRResponse<LinkEditModalStatus, Error> & LinkEditModalUtils => {

  const initialStatus: LinkEditModalStatus = { isOpened: false };
  const swrResponse = useSWRStatic<LinkEditModalStatus, Error>('linkEditModal', undefined, { fallbackData: initialStatus });

  return Object.assign(swrResponse, {
    open: (defaultMarkdownLink: Linker, onSave: (linkText: string) => void) => {
      swrResponse.mutate({ isOpened: true, defaultMarkdownLink, onSave });
    },
    close: () => {
      swrResponse.mutate({ isOpened: false });
    },
  });
};
