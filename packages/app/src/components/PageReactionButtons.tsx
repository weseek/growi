import React, { FC, useState, useEffect } from 'react';
import LikeButtons from './LikeButtons';
import BookmarkButton from './BookmarkButton';


type Props = {
  pageId: string,
  sumOfLikers: number,
  likerIds: string[],
  isLiked: boolean,
  sumOfBookmarks: number,
  isBookmarked: boolean,
  onLikeClicked: ()=>void,
  onBookMarkClicked: ()=>void,
}


const PageReactionButtons : FC<Props> = (props: Props) => {
  const {
    pageId, sumOfLikers, likerIds, isLiked, sumOfBookmarks, isBookmarked, onLikeClicked, onBookMarkClicked,
  } = props;


  return (
    <>
      <span>
        <LikeButtons onLikeClicked={onLikeClicked} pageId={pageId} likerIds={likerIds} sumOfLikers={sumOfLikers} isLiked={isLiked}></LikeButtons>
      </span>
      <span>
        <BookmarkButton sumOfBookmarks={sumOfBookmarks} isBookmarked={isBookmarked} onBookMarkClicked={onBookMarkClicked}></BookmarkButton>
      </span>
    </>
  );
};

export default PageReactionButtons;
