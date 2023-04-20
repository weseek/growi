import React, { useMemo } from 'react';

import { useTranslation } from 'next-i18next';

import { MenuItemType } from './Common/Dropdown/PageItemControl';
import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import { DescendantsPageList } from './DescendantsPageList';
import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import { PageTimeline } from './PageTimeline';

type NotFoundPageProps = {
  path: string,
}

const NotFoundPage = (props: NotFoundPageProps): JSX.Element => {
  const { t } = useTranslation();

  const { path } = props;

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: () => <DescendantsPageList path={path} forceHideMenuItems={[MenuItemType.BOOKMARKS_TREE_MOVE_TO_ROOT]}/>,
        i18n: t('page_list'),
      },
      timeLine: {
        Icon: TimeLineIcon,
        Content: PageTimeline,
        i18n: t('Timeline View'),
      },
    };
  }, [path, t]);

  return (
    <div className="d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} tabContentClasses={['py-4']} />
    </div>
  );
};

export default NotFoundPage;
