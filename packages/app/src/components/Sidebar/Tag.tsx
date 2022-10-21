import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { IDataTagCount } from '~/interfaces/tag';
import { useSWRxTagsList } from '~/stores/tag';

import TagCloudBox from '../TagCloudBox';
import TagList from '../TagList';


const PAGING_LIMIT = 10;
const TAG_CLOUD_LIMIT = 20;

const Tag: FC = () => {
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);

  const { data: tagDataList, mutate: mutateTagDataList, error } = useSWRxTagsList(PAGING_LIMIT, offset);
  const tagData: IDataTagCount[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;
  const isLoading = tagDataList === undefined && error == null;

  const { data: tagDataCloud } = useSWRxTagsList(TAG_CLOUD_LIMIT, 0);
  const tagCloudData: IDataTagCount[] = tagDataCloud?.data || [];

  const { t } = useTranslation('');

  const setOffsetByPageNumber = useCallback((selectedPageNumber: number) => {
    setActivePage(selectedPageNumber);
    setOffset((selectedPageNumber - 1) * PAGING_LIMIT);
  }, []);

  const onReload = useCallback(() => {
    mutateTagDataList();
  }, [mutateTagDataList]);

  // todo: adjust design by XD
  return (
    <div className="grw-container-convertible px-4 mb-5 pb-5" data-testid="grw-sidebar-content-tags">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">{t('Tags')}</h3>
        <button
          type="button"
          className="btn btn-sm ml-auto grw-btn-reload"
          onClick={onReload}
        >
          <i className="icon icon-reload"></i>
        </button>
      </div>

      <h3 className="my-3">{t('tag_list')}</h3>

      { isLoading
        ? (
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mt-3"></i>
          </div>
        )
        : (
          <div data-testid="grw-tags-list">
            <TagList
              tagData={tagData}
              totalTags={totalCount}
              activePage={activePage}
              onChangePage={setOffsetByPageNumber}
              pagingLimit={PAGING_LIMIT}
            />
          </div>
        )
      }

      <div className="d-flex justify-content-center my-5">
        <button
          className="btn btn-primary rounded px-4"
          type="button"
          onClick={() => { window.location.href = '/tags' }}
        >
          {t('Check All tags')}
        </button>
      </div>

      <h3 className="my-3">{t('popular_tags')}</h3>

      <div className="text-center">
        <TagCloudBox tags={tagCloudData} />
      </div>
    </div>
  );

};

export default Tag;
