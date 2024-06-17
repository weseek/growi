import { useState } from 'react';

import withLoadingProps from 'next-dynamic-loading-props';
import dynamic from 'next/dynamic';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import { PagePathNav } from '../PagePathNav';
import type { PagePathNavLayoutProps } from '../PagePathNav';

const PagePathNavSticky = withLoadingProps<PagePathNavLayoutProps>(useLoadingProps => dynamic(
  () => import('~/components/PagePathNavSticky').then(mod => mod.PagePathNavSticky),
  {
    ssr: false,
    loading: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const props = useLoadingProps();
      return <PagePathNav {...props} />;
    },
  },
));

/**
 * Switch PagePathNav and PagePathNavSticky
 * @returns
 */
export const PagePathNavTitle = (props: PagePathNavLayoutProps): JSX.Element => {

  const [isClient, setClient] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setClient(true);
  }, []);

  return isClient
    ? <PagePathNavSticky {...props} />
    : <PagePathNav {...props} />;

};
