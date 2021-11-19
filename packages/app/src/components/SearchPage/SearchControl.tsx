import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';
import DeleteSelectedPageGroup from './DeleteSelectedPageGroup';
import { CheckboxType } from '../../interfaces/search';

type Props = {
  searchingKeyword: string,
  appContainer: AppContainer,
  searchResultCount: number,
  selectAllCheckboxType: CheckboxType,
  onSearchInvoked: (data : any[]) => boolean,
  onExcludeUsersHome?: () => void,
  onExcludeTrash?: () => void,
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
}

const SearchControl: FC <Props> = (props: Props) => {
  // Temporaly workaround for lint error
  // later needs to be fixed: SearchControl to typescript componet
  const SearchPageFormTypeAny : any = SearchPageForm;
  const { t } = useTranslation('');
  const { searchResultCount } = props;

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

  const onDeleteSelectedPageHandler = () => {
    console.log('onDeleteSelectedPageHandler is called');
    // TODO: implement this function to delete selected pages.
    // https://estoc.weseek.co.jp/redmine/issues/77525
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
        {/* Todo: design will be fixed in #80324. Function will be implemented in #77525 */}
        <DeleteSelectedPageGroup
          isCheckboxDisabled={(searchResultCount == null || searchResultCount === 0) || false}
          selectAllCheckboxType={props.selectAllCheckboxType}
          onClickDeleteButton={onDeleteSelectedPageHandler}
          onClickSelectAllCheckbox={props.onClickSelectAllCheckbox}
        />
        <div className="d-flex align-items-center border rounded border-gray px-2 py-1 mr-2 ml-auto">
          <label className="my-0 mr-2" htmlFor="flexCheckDefault">
            {t('Include Subordinated Target Page', { target: '/user' })}
          </label>
          <input
            type="checkbox"
            id="flexCheckDefault"
            onClick={() => onExcludeUsersHome()}
          />
        </div>
        <div className="d-flex align-items-center border rounded border-gray px-2 mr-3">
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
    </div>
  );
};


export default SearchControl;
