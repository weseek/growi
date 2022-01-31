import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import TagList from './TagList';
import TagCloudBox from './TagCloudBox';

import { useSWRxTagList } from '~/stores/tag';
import { toastError } from '~/client/util/apiNotification';
import { ITagDataHasId } from '~/interfaces/tag';

const LIMIT = 10;

const TagPage: FC = () => {
  const [offset, setOffset] = useState<number>(0);

  const { data: tagDataList, mutate: mutatetagDataList } = useSWRxTagList(LIMIT, offset);
  const tagData: ITagDataHasId[] = tagDataList?.data || [];
  const totalCount: number = tagDataList?.totalCount || 0;

  const { t } = useTranslation('');

  const getTagList = async(selectedPageNumber) => {
    setOffset((selectedPageNumber - 1) * LIMIT);

    try {
      mutatetagDataList();
    }
    catch (error) {
      toastError(error);
    }

  };

  if (!tagDataList) return <div>{t('Loading')}</div>;

  return (
    <div className="grw-container-convertible mb-5 pb-5">
      <h2 className="my-3">{`${t('Tags')}(${totalCount})`}</h2>
      <div className="px-3 text-center">
        <TagCloudBox tags={tagData} minSize={20} />
      </div>
      <TagList
        tagData={tagData}
        totalTags={totalCount}
        limit={LIMIT}
        onHandlePagination={getTagList}
      />
    </div>
  );

};

export default TagPage;
