import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';
import DeleteSelectedPageGroup from './DeleteSelectedPageGroup';
import { CheckboxType } from '../../interfaces/search';

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

  const onDeleteSelectedPageHandler = () => {
    console.log('onDeleteSelectedPageHandler is called');
    // TODO: implement this function to delete selected pages.
    // https://estoc.weseek.co.jp/redmine/issues/77525
  };

  const onCheckAllPagesInvoked = (nextCheckboxState:CheckboxType) => {
    console.log(`onCheckAllPagesInvoked is called with arg ${nextCheckboxState}`);
    // Todo: set the checkboxState, isChecked, and indeterminate value of checkbox element according to the passed argument
    // https://estoc.weseek.co.jp/redmine/issues/77525

    // setting checkbox to indeterminate is required to use of useRef to access checkbox element.
    // ref: https://getbootstrap.com/docs/4.5/components/forms/#checkboxes
  };

  return (
    <>
      <div className="search-page-nav d-flex py-3 align-items-center">
        <div className="flex-grow-1 mx-4">
          <SearchPageFormTypeAny
            keyword={props.searchingKeyword}
            appContainer={props.appContainer}
            onSearchFormChanged={props.onSearchInvoked}
          />
        </div>
        <div className="mr-4">
          {/* TODO: replace the following button */}
          <button type="button">related pages</button>
        </div>
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="d-flex align-items-center py-3 border-bottom border-gray">
        <div className="d-flex mr-auto ml-4">
          {/* Todo: design will be fixed in #80324. Function will be implemented in #77525 */}
          <DeleteSelectedPageGroup
            checkboxState={'' || CheckboxType.NONE_CHECKED} // Todo: change the left value to appropriate value
            onClickInvoked={onDeleteSelectedPageHandler}
            onCheckInvoked={onCheckAllPagesInvoked}
          />
        </div>
        <div className="d-flex align-items-center mr-3">
          <div className="border border-gray mr-3">
            <label className="px-3 py-2 mb-0 d-flex align-items-center" htmlFor="flexCheckDefault">
              <input
                className="mr-2"
                type="checkbox"
                id="flexCheckDefault"
                onClick={() => onExcludeUsersHome()}
              />
              {t('Include Subordinated Target Page', { target: '/user' })}
            </label>
          </div>
          <div className="border border-gray">
            <label className="px-3 py-2 mb-0 d-flex align-items-center" htmlFor="flexCheckChecked">
              <input
                className="mr-2"
                type="checkbox"
                id="flexCheckChecked"
                onClick={() => onExcludeTrash()}
              />
              {t('Include Subordinated Target Page', { target: '/trash' })}
            </label>
          </div>
        </div>
      </div>
    </>
  );
};


export default SearchControl;
