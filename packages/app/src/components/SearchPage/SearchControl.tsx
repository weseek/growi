import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';

type Props = {
  searchingKeyword: string,
  appContainer: AppContainer,
  onSearchInvoked: (data : any[]) => boolean,
  onIncludeUsersHome?: () => void,
  onIncludeTrash?: () => void,
}

const SearchControl: FC <Props> = (props: Props) => {
  // Temporaly workaround for lint error
  // later needs to be fixed: SearchControl to typescript componet
  const SearchPageFormTypeAny : any = SearchPageForm;
  const { t } = useTranslation('');

  const onIncludeUsersHome = () => {
    if (props.onIncludeUsersHome != null) {
      props.onIncludeUsersHome();
    }
  };

  const onIncludeTrash = () => {
    if (props.onIncludeTrash != null) {
      props.onIncludeTrash();
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
        {/* ボタン1 */}
        <div className="d-flex align-items-center border rounded border-gray px-2 py-1 mr-2 ml-auto">
          <label className="my-0 mr-2" htmlFor="flexCheckDefault">
            {t('Include Subordinated Target Page', { target: '/user' })}
          </label>
          <input
            type="checkbox"
            id="flexCheckDefault"
            onClick={() => onIncludeUsersHome()}
          />
        </div>
        {/* ボタン２ */}
        <div className="d-flex align-items-center border rounded border-gray px-2 mr-3">
          <label className="my-0 mr-2" htmlFor="flexCheckChecked">
            {t('Include Subordinated Target Page', { target: '/trash' })}
          </label>
          <input
            type="checkbox"
            id="flexCheckChecked"
            onClick={() => onIncludeTrash()}
          />
        </div>
      </div>
    </div>
  );
};


export default SearchControl;
