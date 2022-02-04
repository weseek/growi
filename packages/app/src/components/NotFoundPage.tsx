import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import DescendantsPageList from './DescendantsPageList';
import PageTimeline from './PageTimeline';
import { useCurrentPagePath } from '~/stores/context';


const NotFoundPage = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: currentPagePath } = useCurrentPagePath();

  const DescendantsPageListForThisPage = (): JSX.Element => {
    return currentPagePath != null
      ? <DescendantsPageList path={currentPagePath} />
      : <></>;
  };

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: DescendantsPageListForThisPage,
        i18n: t('page_list'),
        index: 0,
      },
      timeLine: {
        Icon: TimeLineIcon,
        Content: PageTimeline,
        i18n: t('Timeline View'),
        index: 1,
      },
    };
  }, [t]);


  return (
    <div className="d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} />
    </div>
  );
};

export default NotFoundPage;
