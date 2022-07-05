import React, { useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { DescendantsPageListForCurrentPath } from './DescendantsPageList';
import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
// import PageTimeline from './PageTimeline';

const NotFoundPage = (): JSX.Element => {
  const { t } = useTranslation();

  const CustomNavAndContents = dynamic(import('./CustomNavigation/CustomNavAndContents'), { ssr: false });

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: DescendantsPageListForCurrentPath,
        i18n: t('page_list'),
        index: 0,
      },
      timeLine: {
        Icon: TimeLineIcon,
        // Content: PageTimeline,
        Content: () => <></>,
        i18n: t('Timeline View'),
        index: 1,
      },
    };
  }, [t]);


  return (
    <div className="d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} tabContentClasses={['py-4']} />
    </div>
  );
};

export default NotFoundPage;
