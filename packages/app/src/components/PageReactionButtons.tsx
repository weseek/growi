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
  const { pageId, currentUserId } = props;


  const [sumOflikers, setSumOfLikers] = useState(0);
  const [likers, setLikers] = useState<string[]>([]);
  const [isLiked, setIsLiked] = useState(true);

  // component did mount
  useEffect(() => {
    const f = async() => {
      const {
        data: { likerIds, sumOfLikers, isLiked },
      } = await apiv3Get('/page/info', { pageId });
      setSumOfLikers(sumOfLikers);
      setLikers(likerIds);
      setIsLiked(isLiked);
    };
    f();
  }, []);

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
