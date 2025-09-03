import { useEffect, useState } from 'react';

import type { AnyContainer } from './AdminPageFrame';

/**
 * Helper hook to dynamically load and instantiate unstated containers for admin pages.
 * Pass an array of async factory functions returning container instances.
 */
export const useAdminContainers = (factories: Array<() => Promise<AnyContainer>>): AnyContainer[] => {
  const [containers, setContainers] = useState<AnyContainer[]>([]);

  useEffect(() => {
    let canceled = false;
    (async() => {
      const resolved = await Promise.all(factories.map(f => f()));
      if (!canceled) setContainers(resolved);
    })();
    return () => { canceled = true };
  }, [factories]);

  return containers;
};

export default useAdminContainers;
