import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { IDataTagCount } from '~/interfaces/tag';
import { useSWRxTagsList } from '~/stores/tag';

import TagCloudBox from '../TagCloudBox';
import TagList from '../TagList';

import { SidebarHeader } from './SidebarHeader';


const PAGING_LIMIT = 10;
const TAG_CLOUD_LIMIT = 20;

const Tag: FC = () => {

  const router = useRouter();

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
    <div data-testid="grw-sidebar-content-tags">
      <SidebarHeader title='Tags' hasButton onClick={onReload} />
      <div className="grw-container-convertible px-4 mb-5 pb-5">
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
            onClick={() => router.push('/tags')}
          >
            {t('Check All tags')}
          </button>
        </div>

        <h3 className="my-3">{t('popular_tags')}</h3>

        <div className="text-center">
          <TagCloudBox tags={tagCloudData} />
        </div>
      </div>
    </div>
  );

};

export default Tag;
