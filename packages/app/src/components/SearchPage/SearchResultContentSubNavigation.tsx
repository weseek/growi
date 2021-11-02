import React, { FC } from 'react';
import PagePathNav from '../Navbar/PagePathNav';

type Props = {
  pageId: string,
  path: string,
  isCompactMode: boolean,
}

const SearchResultContentSubNavigation: FC<Props> = (props : Props) => {
  const {
    pageId, path,
  } = props;
  return (
    <div className="d-flex">
      {/* Left side */}
      <div className="grw-path-nav-container">
        {/* TODO : refactor TagLabels in a way that it can be used independently from pageContainenr
              TASK: #80623 https://estoc.weseek.co.jp/redmine/issues/80623
          */}
        {/* {isAbleToShowTagLabel && !isCompactMode && !isTagLabelHidden && (
          <div className="grw-taglabels-container">
            <TagLabels editorMode={editorMode} />
          </div>
        )} */}
        <PagePathNav pageId={pageId} pagePath={path} isCompactMode={false} isEditorMode={false} />
      </div>
      {/* Right side */}
      <div className="d-flex">
        {/* TODO: refactor SubNavButtons in a way that it can be used independently from pageContainer
              TASK : #80481 https://estoc.weseek.co.jp/redmine/issues/80481
        */}
        {/* <SubnavButtons isCompactMode={isCompactMode} /> */}
      </div>
    </div>
  );
};


export default SearchResultContentSubNavigation;
