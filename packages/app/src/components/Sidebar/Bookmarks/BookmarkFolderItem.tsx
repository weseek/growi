import { FC } from 'react';

import { useTranslation } from 'next-i18next';

import CountBadge from '~/components/Common/CountBadge';
import TriangleIcon from '~/components/Icons/TriangleIcon';
import { BookmarkFolderItems } from '~/server/models/bookmark-folder';


type BookmarkFolderItemProps = {
  bookmarkFolders: BookmarkFolderItems
}
const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const { bookmarkFolders } = props;
  const { t } = useTranslation();
  const hasChildren = bookmarkFolders.childCount > 0;
  return (
    <div className="grw-pagetree-item-container" >
      <li className="list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center">
        <div className="grw-triangle-container d-flex justify-content-center">
          {hasChildren && (
            <button
              type="button"
              className={'grw-pagetree-triangle-btn btn '}
              onClick={() => {}}
            >
              <div className="d-flex justify-content-center">
                <TriangleIcon />
              </div>
            </button>
          )}

          {
            <div className='grw-pagetree-title-anchor flex-grow-1'>
              <p className={'text-truncate m-auto '}>{bookmarkFolders.bookmarkFolder.name}</p>
            </div>
          }
          {hasChildren && (
            <div className="grw-pagetree-count-wrapper">
              <CountBadge count={bookmarkFolders.childCount } />
            </div>
          )}
        </div>
      </li>
    </div>
  );
};

export default BookmarkFolderItem;
