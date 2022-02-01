import React, {
  FC, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import PaginationWrapper from './PaginationWrapper';
import { ITagDataHasId } from '~/interfaces/tag';

type TagListProps = {
  tagData: ITagDataHasId[],
  totalTags: number,
  activePage: number,
  onChangePage?: (selectedPageNumber: number) => void,
  limit: number,
  isPaginationShown?: boolean,
}

const defaultProps = {
  isPaginationShown: true,
};

const TagList: FC<TagListProps> = (props:(TagListProps & typeof defaultProps)) => {
  const {
    tagData, totalTags, activePage, onChangePage, limit, isPaginationShown,
  } = props;
  const isTagExist: boolean = tagData.length > 0;
  const { t } = useTranslation('');

  const generateTagList = useCallback((tagData) => {
    return tagData.map((data) => {
      // todo: adjust design
      return (
        <a key={data.name} href={`/_search?q=tag:${data.name}`} className="list-group-item">
          <i className="icon-tag mr-2"></i>{data.name}
          <span className="ml-4 list-tag-count badge badge-secondary text-muted">{data.count}</span>
        </a>
      );
    });
  }, []);

  if (!isTagExist) {
    return <h3>{ t('You have no tag, You can set tags on pages') }</h3>;
  }

  return (
    <>
      <ul className="list-group text-left mb-4">
        {generateTagList(tagData)}
      </ul>
      {isPaginationShown
      && (
        <PaginationWrapper
          activePage={activePage}
          changePage={onChangePage}
          totalItemsCount={totalTags}
          pagingLimit={limit}
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
