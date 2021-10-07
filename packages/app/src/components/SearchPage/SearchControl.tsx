import React, { FC } from 'react';
import PropTypes from 'prop-types';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';

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

type Props = {
  searchingKeyword: string,
  appContainer: AppContainer,
  t: (str: string) => string,
  onSearchInvoked: (data : page[]) => boolean,
}

const SearchControl: FC <Props> = (props: Props) => {

  return (
    <div className="">
      <div className="search-page-input sps sps--abv">
        <SearchPageForm
          t={props.t}
          keyword={props.searchingKeyword}
          appContainer={props.appContainer}
          onSearchFormChanged={props.onSearchInvoked}
        />
      </div>
      {/* TODO: place deleteAll button , relevance button , include specificPath button */}
    </div>
  );
};

SearchControl.propTypes = {
  t: PropTypes.func.isRequired,
  searchingKeyword:  PropTypes.string.isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  onSearchInvoked: PropTypes.func.isRequired,
};

export default SearchControl;
