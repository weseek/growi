import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';

type Props = {
  searchingKeyword: string,
  appContainer: AppContainer,
  onSearchInvoked: (data : any[]) => boolean,
  onExcludeUsersHome?: () => void,
  onExcludeTrash?: () => void,
}

const SearchControl: FC <Props> = (props: Props) => {
  // Temporaly workaround for lint error
  // later needs to be fixed: SearchControl to typescript componet
  const SearchPageFormTypeAny : any = SearchPageForm;
  const { t } = useTranslation('');

  const onExcludeUsersHome = () => {
    if (props.onExcludeUsersHome != null) {
      props.onExcludeUsersHome();
    }
  };

  const onExcludeTrash = () => {
    if (props.onExcludeTrash != null) {
      props.onExcludeTrash();
    }
  };

  return (
    <>
      <div className="search-page-nav row py-3 align-items-center">
        <div className="col-8">
          <SearchPageFormTypeAny
            keyword={props.searchingKeyword}
            appContainer={props.appContainer}
            onSearchFormChanged={props.onSearchInvoked}
          />
        </div>
        <div className="col-4">
          {/* TODO: replace the following button */}
          <button type="button">related pages</button>
        </div>
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="row py-3 border-bottom border-gray">
        <div className="col-3">
          {/* TODO: replace the following button */}
          <button type="button">delete button</button>
        </div>
        <div className="col-5"></div>
        <div className="col-2 d-flex align-items-center border border-gray">
          <label className="my-0 mr-2" htmlFor="flexCheckDefault">
            {t('Include Subordinated Target Page', { target: '/user' })}
          </label>
          <input
            type="checkbox"
            id="flexCheckDefault"
            onClick={() => onExcludeUsersHome()}
          />
        </div>
        <div className="col-2 d-flex align-items-center border border-gray">
          <label className="my-0 mr-2" htmlFor="flexCheckChecked">
            {t('Include Subordinated Target Page', { target: '/trash' })}
          </label>
          <input
            type="checkbox"
            id="flexCheckChecked"
            onClick={() => onExcludeTrash()}
          />
        </div>
      </div>
    </>
  );
};


export default SearchControl;
