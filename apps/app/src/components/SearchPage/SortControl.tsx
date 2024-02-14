import type { FC } from 'react';
import React from 'react';

import { useTranslation } from 'next-i18next';

import { SORT_AXIS, SORT_ORDER } from '../../interfaces/search';

const { DESC, ASC } = SORT_ORDER;

type Props = {
  sort: SORT_AXIS,
  order: SORT_ORDER,
  onChange?: (nextSort: SORT_AXIS, nextOrder: SORT_ORDER) => void,
}

const SortControl: FC <Props> = (props: Props) => {

  const { t } = useTranslation('');

  const { sort, order, onChange } = props;

  const onClickChangeSort = (nextSortAxis: SORT_AXIS, nextSortOrder: SORT_ORDER) => {
    if (onChange != null) {
      onChange(nextSortAxis, nextSortOrder);
    }
  };


  return (
    <>
      <div className="d-flex">
        <div className="btn-group">
          <button className="d-flex btn btn-sm btn-outline-neutral-secondary rounded-pill" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span className="material-symbols-outlined text-secondary">sort</span>
            <span className="ms-2 me-6 text-secondary">{t(`search_result.sort_axis.${sort}`)}</span>
            <span className="material-symbols-outlined text-secondary">expand_more</span>
          </button>
          <ul className="dropdown-menu">
            {Object.values(SORT_AXIS).map((sortAxis) => {
              const nextOrder = (sort !== sortAxis || order === ASC) ? DESC : ASC;
              return (
                <button
                  key={sortAxis}
                  className="dropdown-item"
                  type="button"
                  onClick={() => { onClickChangeSort(sortAxis, nextOrder) }}
                >
                  <span>{t(`search_result.sort_axis.${sortAxis}`)}</span>
                </button>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};


export default SortControl;
