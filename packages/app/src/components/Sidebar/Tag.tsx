import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TagList from '../TagList';
import TagCloudBox from '../TagCloudBox';
import { apiGet } from '~/client/util/apiv1-client';
import { toastError } from '~/client/util/apiNotification';

// todo: commonize
type Itag = {
  _id: string,
  name: string,
  count: number,
}

const LIMIT = 10;

const Tag: FC = () => {

  const [tagData, setTagData] = useState<Itag[]>([]);
  const [totalTags, setTotalTags] = useState<number>(0);
  const [isOnReload, setIsOnReload] = useState<boolean>(false);
  const { t } = useTranslation('');

  const getTagList = async(selectPageNumber) => {
    const offset = (selectPageNumber - 1) * LIMIT;
    let res;

    try {
      res = await apiGet('/tags.list', { LIMIT, offset });
    }
    catch (error) {
      toastError(error);
    }

    const tagData = res.data;

    setTagData(tagData);
    setTotalTags(res.totalCount);

  };

  const onReload = () => {
    getTagList(1);
  };

  useEffect(() => {
    const f = async() => {
      getTagList(1);
    };
    f();

    setIsOnReload(false);
  }, [isOnReload]);

  return (
    <>

      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">{t('Tags')}</h3>
        <button
          type="button"
          className="btn btn-sm ml-auto grw-btn-reload-rc"
          onClick={onReload}
        >
          <i className="icon icon-reload"></i>
        </button>
      </div>


      <div className="grw-container-convertible mb-5 pb-5">

        <header className="py-0">
          {/* total tags */}
          <h2 className="my-3">人気のタグ</h2>
        </header>

        <div className="px-3 text-center">
          <TagCloudBox tags={tagData} minSize={20} />

        </div>


        <div className="d-flex justify-content-center">
          <button
            className="btn btn-primary mt-1 mb-4 px-4"
            type="button"
            onClick={() => { window.location.href = '/tags' }}
          >
            {t('Check All tags')}
          </button>
        </div>
        <TagList tagData={tagData} totalTags={totalTags} />
      </div>
    </>
  );

};

export default Tag;
