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
  const { sumOfLikers, isLiked } = likeInfo as ILikeInfo;

  return (
    <>
      {/* TODO GW-4832 show by isAbleToShowLikeButton  */}
      <span>
        {/* TODO GW-4858 create onClick action */}
        <LikeButton count={sumOfLikers} isLiked={isLiked} />
      </span>
      <span>
        {/* TODO GW-4858 create onClick action */}
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

  if (!isViewMode) return <></>;

  return (
    <>
      {/* TODO GW-4827 show by isAbleToShowPageReactionButtons */}
      <PageReactionButtons />
      {/* TODO GW-4829 show by isAbleToShowPageManagement */}
      {/* <PageManagement isCompactMode={isCompactMode} />  */}
    </>
  );
};
