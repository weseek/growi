import { FC } from 'react';
import { LikeButton } from '~/components/Atoms/LikeButton';
import { BookmarkButton } from '~/components/Atoms/BookmarkButton';
import { useCurrentPageSWR, useBookmarkInfoSWR, useLikeInfoSWR } from '~/stores/page';
import { useIsAbleToShowPageReactionButtons, useIsAbleToShowLikeButton } from '~/stores/ui';
import { Page as IPage, BookmarkInfo as IBookmarkInfo, LikeInfo as ILikeInfo } from '~/interfaces/page';
import { apiv3Put } from '~/utils/apiv3-client';

import { PageManagement } from '~/components/PageManagement/PageManagement';


export const PageReactionButtons:FC = () => {
  const { data: page } = useCurrentPageSWR();
  const { _id } = page as IPage;

  const { data: likeInfo, mutate: likeInfoMutate } = useLikeInfoSWR(_id);
  const { sumOfLikers, isLiked } = likeInfo as ILikeInfo;

  const { data: bookmarkInfo, mutate: bookmarkInfoMutate } = useBookmarkInfoSWR(_id);
  const { sumOfBookmarks, isBookmarked } = bookmarkInfo as IBookmarkInfo;

  const { data: isAbleToShowLikeButton } = useIsAbleToShowLikeButton();

  const handleClickLikeButton = async() => {
    const bool = !isLiked;
    await apiv3Put('/page/likes', { pageId: _id, bool });
    likeInfoMutate();
  };

  const handleClickBookmarkButton = async() => {
    const bool = !isBookmarked;
    await apiv3Put('/bookmarks', { pageId: _id, bool });
    bookmarkInfoMutate();
  };

  return (
    <>
      {isAbleToShowLikeButton && (
        <span>
          <LikeButton count={sumOfLikers} isLiked={isLiked} onCLick={handleClickLikeButton} />
        </span>
      )}
      <span>
        <BookmarkButton count={sumOfBookmarks} isBookmarked={isBookmarked} onCLick={handleClickBookmarkButton} />
      </span>
    </>
  );
};

type SubnavButtonsProps ={
  isCompactMode?: boolean;
}

const GrowiSubnavButtons: FC<SubnavButtonsProps> = (props:SubnavButtonsProps) => {
  const { isCompactMode } = props;

  const { data: isAbleToShowPageReactionButtons } = useIsAbleToShowPageReactionButtons();

  return (
    <>
      {isAbleToShowPageReactionButtons && <PageReactionButtons />}
      <PageManagement isCompactMode={isCompactMode} />
    </>
  );
};

export default GrowiSubnavButtons;
