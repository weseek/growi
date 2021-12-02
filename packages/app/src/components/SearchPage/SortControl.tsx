import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SORT_AXIS, SORT_AXIS_CONSTS, SORT_ORDER, SORT_ORDER_CONSTS,
} from '~/utils/search-axis-utils';

const { score: sortByScore, updatedAt: sortByUpdatedAt, createdAt: sortByCreatedAt } = SORT_AXIS_CONSTS;
const { desc, asc } = SORT_ORDER_CONSTS;

type Props = {
  sort: SORT_AXIS,
  order: string,
  onChangeSortInvoked?: (nextSort: SORT_AXIS, nextOrder: SORT_ORDER) => void,
}

const SearchControl: FC <Props> = (props: Props) => {

  const { t } = useTranslation('');

  // TODO: imprement sort dropdown
  // refs: https://redmine.weseek.co.jp/issues/82513
  const onClickChangeSort = () => {
    if (props.onChangeSortInvoked != null) {
      const getNextSort = (sort: SORT_AXIS) => {
        switch (sort) {
          case sortByScore:
            return sortByUpdatedAt;
          case sortByUpdatedAt:
            return sortByCreatedAt;
          case sortByCreatedAt:
          default:
            return sortByScore;
        }
      };
      const nextSort = props.order === desc ? props.sort : getNextSort(props.sort);
      const nextOrder = nextSort === props.sort ? asc : desc;
      props.onChangeSortInvoked(nextSort, nextOrder);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn-link nav-link dropdown-toggle dropdown-toggle-no-caret border-0 rounded grw-btn-page-management py-0"
        data-toggle="dropdown"
      >
        {props.sort}{props.order}
      </button>
      <div className="dropdown-menu dropdown-menu-right">
        {SORT_AXIS_CONSTS.map((axis) => {
          return (
            <button className="dropdown-item text-danger" type="button" onClick={onClickChangeSort}>
              <i className="icon-fw icon-fire"></i>{t('Delete')}
            </button>
          );
        })}
        <button className="dropdown-item" type="button" onClick={() => console.log('duplicate modal show')}>
          <i className="icon-fw icon-star"></i>{t('Add to bookmark')}
        </button>
        <button className="dropdown-item" type="button" onClick={() => console.log('duplicate modal show')}>
          <i className="icon-fw icon-docs"></i>{t('Duplicate')}
        </button>
        <button className="dropdown-item" type="button" onClick={() => console.log('rename function will be added')}>
          <i className="icon-fw  icon-action-redo"></i>{t('Move/Rename')}
        </button>
      </div>
    </>
  );
};


export default SearchControl;
