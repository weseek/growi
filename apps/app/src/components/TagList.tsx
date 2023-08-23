import React, {
  FC, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';

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

      const url = new URL('/_search', 'https://example.com');
      url.searchParams.append('q', `tag:${tag.name}`);

      return (
        <Link
          key={tag._id}
          href={`${url.pathname}${url.search}`}
          className={tagListClasses}
          prefetch={false}
        >
          <div className="text-truncate list-tag-name">{tag.name}</div>
          <div className="ml-4 my-auto py-1 px-2 list-tag-count badge bg-primary">{tag.count}</div>
        </Link>
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
