import React, { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import TagList from './TagList';
import TagCloudBox from './TagCloudBox';

import { useSWRxTagsList } from '~/stores/tag';
import { ITagCountHasId } from '~/interfaces/tag';

const LIMIT = 10;

const TagPage: FC = () => {
  const [offset, setOffset] = useState<number>(0);

  const { data: tagDataList, error } = useSWRxTagsList(LIMIT, offset);
  const tagData: ITagCountHasId[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;
  const isLoading = tagDataList === undefined && error == null;

  const { t } = useTranslation('');

  const setOffsetByPageNumber = useCallback((selectedPageNumber: number) => {
    // offset = (selectedPageNumber - 1) * 10
    setOffset((selectedPageNumber - 1) * 10);
  }, []);

  // todo: adjust margin and redesign tags page
  return (
    <div className="grw-container-convertible mb-5 pb-5">
      <h2 className="my-3">{`${t('Tags')}(${totalCount})`}</h2>
      <div className="px-3 text-center">
        <TagCloudBox tags={tagData} minSize={20} />
      </div>
      { isLoading
        ? (
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mt-3"></i>
          </div>
        )
        : (
          <TagList
            tagData={tagData}
            totalTags={totalCount}
            activePage={1 + (offset / 10)} // activePage = 1 + offset / 10
            onChangePage={setOffsetByPageNumber}
            limit={LIMIT}
          />
        )
      }
    </div>
  );

};

export default TagPage;
