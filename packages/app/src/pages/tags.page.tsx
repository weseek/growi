import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { NextPage } from 'next';

import TagCloudBox from '~/components/TagCloudBox';
import TagList from '~/components/TagList';
import { IDataTagCount } from '~/interfaces/tag';
import { useSWRxTagsList } from '~/stores/tag';

import { BasicLayout } from '../components/BasicLayout';
import { CommonProps } from './commons';

const PAGING_LIMIT = 10;

const TagPage: NextPage<CommonProps> = () => {
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);

  const { data: tagDataList, error } = useSWRxTagsList(PAGING_LIMIT, offset);
  const tagData: IDataTagCount[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;
  const isLoading = tagDataList === undefined && error == null;

  const { t } = useTranslation('');

  const setOffsetByPageNumber = useCallback((selectedPageNumber: number) => {
    setActivePage(selectedPageNumber);
    setOffset((selectedPageNumber - 1) * PAGING_LIMIT);
  }, []);

  // todo: adjust margin and redesign tags page
  return (
    <>
      <Head>
      </Head>
      <BasicLayout title='tags'>
        <div className="grw-container-convertible mb-5 pb-5">
          <h2 className="my-3">{`${t('Tags')}(${totalCount})`}</h2>
          <div className="px-3 mb-5 text-center">
            <TagCloudBox tags={tagData} minSize={20} />
          </div>
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
        </div>
      </BasicLayout>
    </>
  );

};

export default TagPage;
