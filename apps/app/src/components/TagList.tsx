import React, {
  FC, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';

import { useKeywordManager } from '~/client/services/search-operation';
import { IDataTagCount } from '~/interfaces/tag';

import PaginationWrapper from './PaginationWrapper';

type TagListProps = {
  tagData: IDataTagCount[],
  totalTags: number,
  activePage: number,
  onChangePage?: (selectedPageNumber: number) => void,
  pagingLimit: number,
  isPaginationShown?: boolean,
}

const defaultProps = {
  isPaginationShown: true,
};

const TagList: FC<TagListProps> = (props:(TagListProps & typeof defaultProps)) => {
  const {
    tagData, totalTags, activePage, onChangePage, pagingLimit, isPaginationShown,
  } = props;
  const isTagExist: boolean = tagData.length > 0;
  const { t } = useTranslation('');

  const { pushState } = useKeywordManager();

  const generateTagList = useCallback((tagData) => {
    return tagData.map((tag:IDataTagCount) => {
      return (
        <button
          key={tag._id}
          type="button"
          className="list-group-item list-group-item-action d-flex"
          onClick={() => pushState(`tag:${tag.name}`)}
        >
          <div className="text-truncate list-tag-name">{tag.name}</div>
          <div className="ms-4 my-auto py-1 px-2 list-tag-count badge bg-primary">{tag.count}</div>
        </button>
      );
    });
  }, [pushState]);

  if (!isTagExist) {
    return <h3>{ t('You have no tag, You can set tags on pages') }</h3>;
  }

  return (
    <>
      <div className="list-group text-start mb-5">
        {generateTagList(tagData)}
      </div>
      {isPaginationShown
      && (
        <PaginationWrapper
          activePage={activePage}
          changePage={onChangePage}
          totalItemsCount={totalTags}
          pagingLimit={pagingLimit}
          align="center"
          size="md"
        />
      )
      }
    </>
  );

};

TagList.defaultProps = defaultProps;

export default TagList;
