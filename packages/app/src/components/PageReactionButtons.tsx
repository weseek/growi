import React, { FC, useState, useEffect } from 'react';
import LikeButtons from './LikeButtons';


type Props = {
  pageId: string,
  sumOfLikers: number,
  likerIds: string[],
  isLiked: boolean,
  onLikeClicked: (isLiked : boolean)=>void,
}

const LikeButtonsWrapper = (props) => {
  return <LikeButtons {...props}></LikeButtons>;
};

const PageReactionButtons : FC<Props> = (props: Props) => {
  const {
    pageId, sumOfLikers, likerIds, isLiked, onLikeClicked,
  } = props;


  return (
    <>
      <span>
        <LikeButtonsWrapper onLikeClicked={onLikeClicked} pageId={pageId} likerIds={likerIds} sumOfLikers={sumOfLikers} isLiked={isLiked}></LikeButtonsWrapper>
      </span>
      <span>
        {/*
          TODO:
          once 80335 is done, merge 77543 branch(parent of 80335) into 77524.
          (pageContainer dependencies in bookmark, delete modal, rename etc are removed)
          then place BookMarkButton here
          TASK: https://estoc.weseek.co.jp/redmine/issues/81076
        */}
        {/* <BookmarkButton></BookmarkButton> */}
      </span>
    </>
  );
};

export default PageReactionButtons;
