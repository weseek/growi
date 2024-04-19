import { useMemo, useRef } from 'react';

import { useSWRxCurrentPage } from '~/stores/page';
import { usePageControlsX } from '~/stores/ui';

import { PagePathHeader } from './PagePathHeader';
import { PageTitleHeader } from './PageTitleHeader';

import styles from './PageHeader.module.scss';

const moduleClass = styles['page-header'] ?? '';

export const PageHeader = (): JSX.Element => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: pageControlsX } = usePageControlsX();
  const pageHeaderRef = useRef<HTMLDivElement>(null);

  const maxWidth = useMemo(() => {
    if (pageControlsX == null || pageHeaderRef.current == null) {
      return undefined;
    }
    // At least 10px space between PageHeader and PageControls
    return pageControlsX - pageHeaderRef.current.getBoundingClientRect().x - 10;
  }, [pageControlsX]);

  if (currentPage == null) {
    return <></>;
  }

  return (
    <div className={`${moduleClass} w-100`} ref={pageHeaderRef}>
      <PagePathHeader
        currentPage={currentPage}
        maxWidth={maxWidth}
      />
      <div className="mt-1">
        <PageTitleHeader
          currentPage={currentPage}
          maxWidth={maxWidth}
        />
      </div>
    </div>
  );
};
