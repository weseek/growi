import { FC } from 'react';
import { LikeButton } from '~/components/Atoms/LikeButton';
import { BookmarkButton } from '~/components/Atoms/BookmarkButton';
import { useCurrentPageSWR, useIsBookmarkInfoSWR, useLikeInfoSWR } from '~/stores/page';
import { Page as IPage, BookmarkInfo as IBookmarkInfo, LikeInfo as ILikeInfo } from '~/interfaces/page';

export const PageReactionButtons:FC = () => {
  const { data: page } = useCurrentPageSWR();
  const { id } = page as IPage;

  const { data: bookmarkInfo } = useIsBookmarkInfoSWR(id);
  const { sumOfBookmarks, isBookmarked } = bookmarkInfo as IBookmarkInfo;

  const { data: likeInfo } = useLikeInfoSWR(id);
  console.log(likeInfo);
  const { sumOfLikers, isLiked } = likeInfo as ILikeInfo;

  return (
    <>
      {/* pageContainer.isAbleToShowLikeButton  */}
      <span>
        <LikeButton count={sumOfLikers} isLiked={isLiked} />
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
