import React from 'react';

type Props = {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
};

export const SidebarHeaderReloadButton = ({ onClick }: Props) => {

  return (
    <button type="button" className="btn btn-sm ms-auto py-0 grw-btn-reload" onClick={onClick}>
      <i className="icon icon-reload"></i>
    </button>
  );
};
