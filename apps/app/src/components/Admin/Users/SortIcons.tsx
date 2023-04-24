import React from 'react';

type SortIconsProps = {
  onClick: (sortOrder: string) => void,
  isSelected: boolean,
  isAsc: boolean,
}

export const SortIcons = (props: SortIconsProps): JSX.Element => {

  const { onClick, isSelected, isAsc } = props;

  return (
    <div className="d-flex flex-column text-center">
      <a
        className={`fa ${isSelected && isAsc ? 'fa-chevron-up' : 'fa-angle-up'}`}
        aria-hidden="true"
        onClick={() => onClick('asc')}
      />
      <a
        className={`fa ${isSelected && !isAsc ? 'fa-chevron-down' : 'fa-angle-down'}`}
        aria-hidden="true"
        onClick={() => onClick('desc')}
      />
    </div>
  );
};
