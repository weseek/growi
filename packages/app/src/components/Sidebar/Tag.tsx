import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import TagList from '../TagList';
import TagCloudBox from '../TagCloudBox';

import { useSWRxTagList } from '~/stores/tag';

import { toastError } from '~/client/util/apiNotification';
import { ITagDataHasId } from '~/interfaces/tag';

const LIMIT = 10;

const Tag: FC = () => {

  // const [tagData, setTagData] = useState<ITagDataHasId[]>([]);
  // const [totalTags, setTotalTags] = useState<number>(0);
  const [isOnReload, setIsOnReload] = useState<boolean>(false);

  const [offset, setOffset] = useState<number>(0);

  const { data: tagDataList, mutate } = useSWRxTagList(LIMIT, offset);
  const tagData: ITagDataHasId[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;

  const { t } = useTranslation('');

  const getTagList = async(selectedPageNumber) => {
    setOffset((selectedPageNumber - 1) * LIMIT);

    try {
      mutate();
    }
    catch (error) {
      toastError(error);
    }

    setIsOnReload(false);
  };

  const onReload = () => {
    setIsOnReload(true);
  };


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
        limit={LIMIT}
        isOnReload={isOnReload}
        onHandlePagination={getTagList}
      />
    </div>
  );

};

export default Tag;
