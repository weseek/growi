import React, { FC } from 'react';
import LikeButtons from './LikeButtons';
import { IUser } from '../interfaces/user';
import BookmarkButtons from './BookmarkButtons';

type Props = {
  isCompactMode?: boolean,

  isLiked: boolean,
  sumOfLikers: number,
  likers: IUser[],
  onLikeClicked?: ()=>void,

  isBookmarked: boolean,
  sumOfBookmarks: number,
  bookmarkedUsers: IUser[]
  onBookMarkClicked: ()=>void,
}


const PageReactionButtons : FC<Props> = (props: Props) => {
  const {
    isCompactMode, sumOfLikers, isLiked, likers, onLikeClicked, sumOfBookmarks, isBookmarked, bookmarkedUsers, onBookMarkClicked,
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
      <BookmarkButtons
        hideTotalNumber={isCompactMode}
        sumOfBookmarks={sumOfBookmarks}
        isBookmarked={isBookmarked}
        bookmarkedUsers={bookmarkedUsers}
        onBookMarkClicked={onBookMarkClicked}
      >
      </BookmarkButtons>
    </>
  );
};

export default PageReactionButtons;
