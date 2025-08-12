import { useEffect } from 'react';

import { isClient } from '@growi/core/dist/utils';
import { useRouter } from 'next/router';

import type { Props } from './types';

/**
 * Custom hook for syncing pathname by Shallow Routing
 * Optimized to avoid unnecessary updates and handle URL synchronization
 */
export const useShallowRouting = (props: Props): void => {
  const router = useRouter();

  // Sync pathname by Shallow Routing - optimize to avoid unnecessary updates
  useEffect(() => {
    if (isClient() && props.currentPathname) {
      const decodedURI = decodeURI(window.location.pathname);
      if (decodedURI !== props.currentPathname) {
        const { search, hash } = window.location;
        router.replace(`${props.currentPathname}${search}${hash}`, undefined, { shallow: true });
      }
    }
  }, [props.currentPathname, router]);
};
