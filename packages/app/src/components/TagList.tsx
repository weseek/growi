import React, {
  FC, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';

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

  const generateTagList = useCallback((tagData) => {
    return tagData.map((tag:IDataTagCount, index:number) => {
      const tagListClasses: string = index === 0 ? 'list-group-item d-flex' : 'list-group-item d-flex border-top-0';

      return (
        <a
          key={tag._id}
          href={`/_search?q=tag:${encodeURIComponent(tag.name)}`}
          className={tagListClasses}
        >
          <div className="text-truncate list-tag-name">{tag.name}</div>
          <div className="ml-4 my-auto py-1 px-2 list-tag-count badge badge-secondary text-white">{tag.count}</div>
        </a>
      );
    });
  }, []);

  if (!isTagExist) {
    return <h3>{ t('You have no tag, You can set tags on pages') }</h3>;
  }

  return (
    <>
      <ul className="list-group text-left mb-5">
        {generateTagList(tagData)}
      </ul>
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
