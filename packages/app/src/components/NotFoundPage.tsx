import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import DescendantsPageList from './DescendantsPageList';
import PageTimeline from './PageTimeline';

const NotFoundPage = (): JSX.Element => {
  const { t } = useTranslation();

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: DescendantsPageList,
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
