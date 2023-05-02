import React from 'react';

import { BookmarkFolderItems } from '~/interfaces/bookmark-info';

export const BookmarkFolderMenuItem: React.FC<{
  item: BookmarkFolderItems
  isSelected: boolean
}> = ({
  item,
  isSelected,
}) => {
  return (
    <div className='d-flex justify-content-start grw-bookmark-folder-menu-item-title'>
      <input
        type="radio"
        checked={isSelected}
        name="bookmark-folder-menu-item"
        id={`bookmark-folder-menu-item-${item._id}`}
        onChange={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      />
      <label htmlFor={`bookmark-folder-menu-item-${item._id}`} className='p-2 m-0'>
        {item.name}
      </label>
    </div>
  );
};
