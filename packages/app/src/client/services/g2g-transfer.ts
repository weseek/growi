import { useMemo, useState } from 'react';

import { throttle } from 'throttle-debounce';

import { apiv3Post } from '~/client/util/apiv3-client';

// eslint-disable-next-line @typescript-eslint/ban-types
export const useGenerateTransferKeyWithThrottle = (): {transferKey: string, generateTransferKeyWithThrottle: Function} => {
  const [transferKey, setTransferKey] = useState('');

  const generateTransferKeyWithThrottle = useMemo(() => {
    const href = document.location.href;
    const url = new URL(href);

    return throttle(1000, async() => {
      const response = await apiv3Post('/g2g-transfer/generate-key', { appSiteUrl: url.origin });
      const { transferKey } = response.data;
      setTransferKey(transferKey);
    });
  }, []);

  return { transferKey, generateTransferKeyWithThrottle };
};
