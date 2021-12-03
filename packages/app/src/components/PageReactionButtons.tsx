import React, { FC } from 'react';
import LikeButtons from './LikeButtons';
import { IUser } from '../interfaces/user';
import BookmarkButton from './BookmarkButton';

type Props = {
  sumOfLikers: number,
  isLiked: boolean,
  likers: IUser[],
  onLikeClicked?: ()=>void,
  sumOfBookmarks: number,
  isBookmarked: boolean,
  onBookMarkClicked: ()=>void,
}


const PageReactionButtons : FC<Props> = (props: Props) => {
  const {
    sumOfLikers, isLiked, likers, onLikeClicked, sumOfBookmarks, isBookmarked, onBookMarkClicked,
  } = props;


  return (
    <>
      <span>
        <LikeButtons
          onLikeClicked={onLikeClicked}
          sumOfLikers={sumOfLikers}
          isLiked={isLiked}
          likers={likers}
        >
        </LikeButtons>
      </span>
      <span>
        <BookmarkButton sumOfBookmarks={sumOfBookmarks} isBookmarked={isBookmarked} onBookMarkClicked={onBookMarkClicked}></BookmarkButton>
      </span>
    </>
  );
};

export default PageReactionButtons;
