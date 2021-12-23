import React, { FC } from 'react';
import LikeButtons from './LikeButtons';
import { IUser } from '../interfaces/user';
import BookmarkButton from './BookmarkButton';

type Props = {
  isCompactMode?: boolean,

  isLiked: boolean,
  sumOfLikers: number,
  likers: IUser[],
  onLikeClicked?: ()=>void,

  isBookmarked: boolean,
  sumOfBookmarks: number,
  onBookMarkClicked: ()=>void,
}


const PageReactionButtons : FC<Props> = (props: Props) => {
  const {
    isCompactMode, sumOfLikers, isLiked, likers, onLikeClicked, sumOfBookmarks, isBookmarked, onBookMarkClicked,
  } = props;


  return (
    <>
      <LikeButtons
        hideTotalNumber={isCompactMode}
        onLikeClicked={onLikeClicked}
        sumOfLikers={sumOfLikers}
        isLiked={isLiked}
        likers={likers}
      >
      </LikeButtons>
      <BookmarkButton
        hideTotalNumber={isCompactMode}
        sumOfBookmarks={sumOfBookmarks}
        isBookmarked={isBookmarked}
        onBookMarkClicked={onBookMarkClicked}
      >
      </BookmarkButton>
    </>
  );
};

export default PageReactionButtons;
