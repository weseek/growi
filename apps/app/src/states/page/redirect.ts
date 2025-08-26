import { atom, useAtom } from 'jotai';

import type { UseAtom } from '../helper';

/**
 * Atom for redirect from path
 */
const redirectFromAtom = atom<string | null>(null);

export const useRedirectFrom = (): UseAtom<typeof redirectFromAtom> => {
  return useAtom(redirectFromAtom);
};
