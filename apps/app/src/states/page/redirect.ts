import { atom, useAtom } from 'jotai';

/**
 * Atom for redirect from path
 */
const redirectFromAtom = atom<string | null>(null);

export const useRedirectFrom = () => useAtom(redirectFromAtom);
