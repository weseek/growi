import { FC } from 'react';
import { LikeButton } from '~/components/Atoms/LikeButton';
import { BookmarkButton } from '~/components/Atoms/BookmarkButton';
import { useCurrentPageSWR, useBookmarkInfoSWR, useLikeInfoSWR } from '~/stores/page';
import { Page as IPage, BookmarkInfo as IBookmarkInfo, LikeInfo as ILikeInfo } from '~/interfaces/page';
import { apiv3Put } from '~/utils/apiv3-client';

export const PageReactionButtons:FC = () => {
  const { data: page } = useCurrentPageSWR();
  const { id } = page as IPage;

  const { data: likeInfo, mutate: likeInfoMutate } = useLikeInfoSWR(id);
  const { sumOfLikers, isLiked } = likeInfo as ILikeInfo;

  const { data: bookmarkInfo, mutate: bookmarkInfoMutate } = useBookmarkInfoSWR(id);
  const { sumOfBookmarks, isBookmarked } = bookmarkInfo as IBookmarkInfo;


  const handleClickLikeButton = async() => {
    const bool = !isLiked;
    await apiv3Put('/page/likes', { pageId: id, bool });
    likeInfoMutate();
  };

  const handleClickBookmarkButton = async() => {
    const bool = !isBookmarked;
    await apiv3Put('/bookmarks', { pageId: id, bool });
    bookmarkInfoMutate();
  };

  return (
    <>
      {/* TODO GW-4832 show by isAbleToShowLikeButton  */}
      <span>
        <LikeButton count={sumOfLikers} isLiked={isLiked} onCLick={handleClickLikeButton} />
      </span>
      <span>
        <BookmarkButton count={sumOfBookmarks} isBookmarked={isBookmarked} onCLick={handleClickBookmarkButton} />
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
