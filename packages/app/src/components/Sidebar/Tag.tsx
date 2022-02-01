import React, { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import TagList from '../TagList';
import TagCloudBox from '../TagCloudBox';

import { useSWRxTagDataList } from '~/stores/tag';
import { ITagDataHasId } from '~/interfaces/tag';

const LIMIT = 10;

const Tag: FC = () => {
  const [offset, setOffset] = useState<number>(0);

  const { data: tagDataList, mutate: mutateTagDataList } = useSWRxTagDataList(LIMIT, offset);
  const tagData: ITagDataHasId[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;

  const { t } = useTranslation('');

  const setOffsetByPageNumber = useCallback((selectedPageNumber: number) => {
    // offset = (selectedPageNumber - 1) * 10
    setOffset((selectedPageNumber - 1) * 10);
  }, []);

  const onReload = useCallback(() => {
    mutateTagDataList();
  }, [mutateTagDataList]);

  // todo: consider loading state by designer's advice
  if (!tagDataList) return <div>{t('Loading')}</div>;

  // todo: adjust design by XD
  return (
    <div className="grw-container-convertible px-4 mb-5 pb-5">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">{t('Tags')}</h3>
        <button
          type="button"
          className="btn btn-sm ml-auto grw-btn-reload-rc"
          onClick={onReload}
        >
          <i className="icon icon-reload"></i>
        </button>
      </div>
      <h2 className="my-3">{t('popular_tags')}</h2>

      <div className="px-3 text-center">
        <TagCloudBox tags={tagData} minSize={20} />
      </div>
      <div className="d-flex justify-content-center">
        <button
          className="btn btn-primary mt-3 mb-4 px-5"
          type="button"
          onClick={() => { window.location.href = '/tags' }}
        >
          {t('Check All tags')}
        </button>
      </div>
      <TagList
        tagData={tagData}
        totalTags={totalCount}
        activePage={1 + (offset / 10)} // activePage = 1 + offset / 10
        onChangePage={setOffsetByPageNumber}
        limit={LIMIT}
      />
    </div>
  );

};

export default Tag;
