import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SORT_AXIS, SORT_ORDER } from '../../interfaces/search';

const { DESC, ASC } = SORT_ORDER;

type Props = {
  sort: SORT_AXIS,
  order: string,
  onChangeSortInvoked?: (nextSort: SORT_AXIS, nextOrder: SORT_ORDER) => void,
}

const SortControl: FC <Props> = (props: Props) => {

  const { t } = useTranslation('');

  const onClickChangeSort = (nextSortAxis: SORT_AXIS, nextSortOrder: SORT_ORDER) => {
    if (props.onChangeSortInvoked != null) {
      props.onChangeSortInvoked(nextSortAxis, nextSortOrder);
    }
  };

  const renderOrderIcon = (order: SORT_ORDER) => {
    const iconClassName = ASC === order ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
    return <i className={iconClassName} aria-hidden="true" />;
  };

  const renderSortItem = (sort, order) => {
    return <><span className="mr-3">{t(`search_result.sort_axis.${sort}`)}</span>{renderOrderIcon(order)}</>;
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-outline-secondary btn-dropdown-toggle dropdown-toggle-no-caret"
        data-toggle="dropdown"
      >
        {renderSortItem(props.sort, props.order)}
      </button>
      <div className="dropdown-menu dropdown-menu-right">
        {Object.values(SORT_AXIS).map((sortAxis) => {
          const nextOrder = (props.sort !== sortAxis || props.order === ASC) ? DESC : ASC;
          return (
            <button
              className="dropdown-item d-flex justify-content-between"
              type="button"
              onClick={() => { onClickChangeSort(sortAxis, nextOrder) }}
            >
              {renderSortItem(sortAxis, nextOrder)}
            </button>
          );
        })}
      </div>
    </>
  );
};


export default SortControl;
