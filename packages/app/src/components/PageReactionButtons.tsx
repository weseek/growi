import React, { FC, useState, useEffect } from 'react';
import LikeButtons from './LikeButtons';
import { apiv3Get } from '../client/util/apiv3-client';


type Props = {
  pageId: string,
  currentUserId: string,
  likerSum: number,
  likerIds: string[],
  isAlreadyLiked: boolean,
}

const LikeButtonsWrapper = (props) => {
  return <LikeButtons {...props}></LikeButtons>;
};

const PageReactionButtons : FC<Props> = (props: Props) => {
  const {
    pageId, currentUserId, likerSum, likerIds, isAlreadyLiked,
  } = props;
  const [sumOflikers, setSumOfLikers] = useState(likerSum);
  const [likers, setLikers] = useState<string[]>(likerIds);
  const [isLiked, setIsLiked] = useState(isAlreadyLiked);

  useEffect(() => {
    setSumOfLikers(likerSum);
    setLikers(likerIds);
    setIsLiked(isAlreadyLiked);
  }, [props]);


  const likeInvoked = async() => {
    setSumOfLikers(sumOflikers => (isLiked ? sumOflikers - 1 : sumOflikers + 1));
    setLikers(likerIds => (isLiked ? likerIds.filter(id => id !== currentUserId) : [...likerIds, currentUserId]));
    setIsLiked(isLiked => !isLiked);
  };

  return (
    <>
      <span>
        <LikeButtonsWrapper onChangeInvoked={likeInvoked} pageId={pageId} likers={likers} sumOfLikers={sumOflikers} isLiked={isLiked}></LikeButtonsWrapper>
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
