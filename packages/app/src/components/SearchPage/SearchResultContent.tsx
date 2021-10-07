import React, { FC } from 'react';
import PropTypes from 'prop-types';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '~/client/services/AppContainer';

type page = {
  status: string,
  grant: number,
  grantedUsers: string[],
  liker: string[],
  seenUsers: string[],
  commentCount: number,
  _id: string,
  createdAt: string,
  updatedAt: string,
  path: string,
  creator: string,
  lastUpdateUser: {
    isGravatarEnabled: boolean,
    isEmailPublished: boolean,
    lang: string,
    status: number,
    admin: boolean,
    isInvitationEmailSended: boolean,
    _id: string,
    createdAt: string,
    name: string,
    username: string,
    email: string,
    imageUrlCached: string,
    lastLoginAt: string,
  },
  redirecTo: string,
  grantedGroup: string[],
  _v : string,
  revision: string,
  id: string
}

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  selectedPage : page,
}
const SearchResultContent: FC<Props> = (props: Props) => {
  const renderPage = (page) => {
    const growiRenderer = props.appContainer.getRenderer('searchresult');
    let showTags = false;
    if (page.tags != null && page.tags.length > 0) { showTags = true }
    return (
      <div key={page._id} className="search-result-page mb-5">
        <h2>
          <a href={page.path} className="text-break">
            {page.path}
          </a>
          {showTags && (
            <div className="mt-1 small">
              <i className="tag-icon icon-tag"></i> {page.tags.join(', ')}
            </div>
          )}
        </h2>
        <RevisionLoader
          growiRenderer={growiRenderer}
          pageId={page._id}
          pagePath={page.path}
          revisionId={page.revision}
          highlightKeywords={props.searchingKeyword}
        />
      </div>
    );
  };
  const content = renderPage(props.selectedPage);
  return (

    <div>{content}</div>
  );
};

SearchResultContent.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  searchingKeyword: PropTypes.string.isRequired,
  // selectedPage: PropTypes.object.isRequired,  // fix this
};

export default SearchResultContent;
