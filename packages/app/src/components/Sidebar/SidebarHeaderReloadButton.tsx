import React from 'react';

export const SidebarHeaderReloadButton = ({ onClick }) => {

  return (
    <button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => onClick()}>
      <i className="icon icon-reload"></i>
    </button>
  );
};
