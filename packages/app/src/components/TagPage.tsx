import React, { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import TagList from './TagList';
import TagCloudBox from './TagCloudBox';

import { useSWRxTagDataList } from '~/stores/tag';
import { ITagDataHasId } from '~/interfaces/tag';

const LIMIT = 10;

const TagPage: FC = () => {
  const [offset, setOffset] = useState<number>(0);

  const { data: tagDataList } = useSWRxTagDataList(LIMIT, offset);
  const tagData: ITagDataHasId[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;

  const { t } = useTranslation('');

  const setOffsetByPageNumber = useCallback((selectedPageNumber: number):void => {
    // offset = (selectedPageNumber - 1) * 10
    setOffset((selectedPageNumber - 1) * 10);
  }, []);

  // todo: consider loading state by designer's advice
  if (!tagDataList) return <div>{t('Loading')}</div>;

  // todo: adjust margin and redesign tags page
  return (
    <div className="grw-container-convertible mb-5 pb-5">
      <h2 className="my-3">{`${t('Tags')}(${totalCount})`}</h2>
      <div className="px-3 text-center">
        <TagCloudBox tags={tagData} minSize={20} />
      </div>
      <TagList
        tagData={tagData}
        totalTags={totalCount}
        activePage={1 + offset / 10} // activePage = 1 + offset / 10
        onChangePage={setOffsetByPageNumber}
        limit={LIMIT}
      />
    </div>
  );

};

export default TagPage;
