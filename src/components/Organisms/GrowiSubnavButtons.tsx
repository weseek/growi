import { FC } from 'react';
import { LikeButton } from '~/components/Atoms/LikeButton';
import { BookmarkButton } from '~/components/Atoms/BookmarkButton';
import { useCurrentPageSWR, useIsBookmarkedSWR } from '~/stores/page';
import { Page as IPage, BookmarkInfo as IBookmarkInfo } from '~/interfaces/page';

export const PageReactionButtons:FC = () => {
  const { data: page } = useCurrentPageSWR();
  const { id } = page as IPage;

  const { data: bookmarkInfo } = useIsBookmarkedSWR(id);
  const { sumOfBookmarks, isBookmarked } = bookmarkInfo as IBookmarkInfo;


  return (
    <>
      {/* pageContainer.isAbleToShowLikeButton  */}
      <span>
        <LikeButton />
      </span>
      <span>
        <BookmarkButton count={sumOfBookmarks} isBookmarked={isBookmarked} />
      </span>
    </>
  );
};

type SubnavButtonsProps ={
  isCompactMode?: boolean;
  isViewMode?: boolean;
}

export const GrowiSubnavButtons:FC<SubnavButtonsProps> = (props:SubnavButtonsProps) => {
  const { isCompactMode, isViewMode } = props;

  return (
    <>
      {isViewMode && (
        <>
          {/* TODO  isAbleToShowPageReactionButtons */}
          <PageReactionButtons />
          {/* <PageManagement isCompactMode={isCompactMode} />  */}
        </>
      )}
    </>
  );
};
