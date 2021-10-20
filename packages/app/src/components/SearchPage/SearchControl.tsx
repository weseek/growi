import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';

type Props = {
  searchingKeyword: string,
  appContainer: AppContainer,
  onSearchInvoked: (data : any[]) => boolean,
  onExcludeUsersHome: (() => void) | null,
  onExcludeTrash: (() => void) | null,
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
    <div className="">
      <div className="search-page-input sps sps--abv">
        <SearchPageFormTypeAny
          keyword={props.searchingKeyword}
          appContainer={props.appContainer}
          onSearchFormChanged={props.onSearchInvoked}
        />
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="d-flex my-4">
        <div className="form-check border-gray">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckDefault"
            onClick={() => onExcludeUsersHome()}
          />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            {t('Include Subordinated Target Page', { target: '/user' })}
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckChecked"
            onClick={() => onExcludeTrash()}
          />
          <label className="form-check-label" htmlFor="flexCheckChecked">
            {t('Include Subordinated Target Page', { target: '/trash' })}
          </label>
        </div>
      </div>
    </div>
  );
};


export default SearchControl;
