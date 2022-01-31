import React, {
  FC, useState, useEffect, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import PaginationWrapper from './PaginationWrapper';
import { ITagDataHasId } from '~/interfaces/tag';

type TagListProps = {
  tagData: ITagDataHasId[],
  totalTags: number,
  limit: number,
  isOnReload?: boolean,
  onHandlePagination?: (selectedPageNumber:number) => void
}

const TagList: FC<TagListProps> = (props:TagListProps) => {
  const [activePage, setActivePage] = useState<number>(1);
  const {
    tagData, totalTags, limit, isOnReload, onHandlePagination,
  } = props;
  const isTagExist: boolean = tagData.length > 0;
  const { t } = useTranslation('');

  const reloadHandler = useCallback(() => {
    if ((isOnReload != null && isOnReload) && onHandlePagination != null) {
      onHandlePagination(activePage);
    }
  }, [isOnReload, onHandlePagination, activePage]);

  useEffect(() => {
    reloadHandler();
  });

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

  const paginationHandler = useCallback((selectedPage) => {
    if (onHandlePagination != null) {
      onHandlePagination(selectedPage);
      setActivePage(selectedPage);
    }
  }, [onHandlePagination]);

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
        pagingLimit={limit}
        align="center"
        size="md"
      />
    </>
  );

};

export default TagList;
