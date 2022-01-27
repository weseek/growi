import React, { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PaginationWrapper from './PaginationWrapper';

type Itag = {
  _id: string,
  name: string,
  count: number,
}

type TagListProps = {
  tagData: Itag[],
  totalTags: number,
  onHandlePage?: ((selectPageNumber:number) => void)
}

const PAGING_LIMIT = 10;

const TagList: FC<TagListProps> = (props:TagListProps) => {
  const [activePage, setActivePage] = useState<number>(1);
  const { tagData, totalTags, onHandlePage } = props;
  const isTagExist: boolean = tagData.length > 0;
  const { t } = useTranslation('');

  const generateTagList = useCallback((tagData) => {
    return tagData.map((data) => {
      return (
        <a key={data.name} href={`/_search?q=tag:${data.name}`} className="list-group-item">
          <i className="icon-tag mr-2"></i>{data.name}
          <span className="ml-4 list-tag-count badge badge-secondary text-muted">{data.count}</span>
        </a>
      );
    });
  }, []);

  const paginationHandler = useCallback(async(selectedPage) => {
    if (onHandlePage != null) {
      onHandlePage(selectedPage);
      setActivePage(selectedPage);
    }
  }, [onHandlePage]);

  if (!isTagExist) {
    return <h3>{ t('You have no tag, You can set tags on pages') }</h3>;
  }

  return (
    <>
      <ul className="list-group text-left mb-4">
        {generateTagList(tagData)}
      </ul>
      <PaginationWrapper
        activePage={activePage}
        changePage={paginationHandler}
        totalItemsCount={totalTags}
        pagingLimit={PAGING_LIMIT}
        align="center"
        size="md"
      />
    </>
  );

};

export default TagList;
