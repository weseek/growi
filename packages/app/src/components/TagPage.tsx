import React, { FC, useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { IDataTagCount } from '~/interfaces/tag';
import { useSWRxTagsList } from '~/stores/tag';

import TagCloudBox from './TagCloudBox';
import TagList from './TagList';

const PAGING_LIMIT = 10;

const TagPage: FC = () => {
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
  );

};

export default TagPage;
