import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';
import DeleteSelectedPageGroup, {
  NONE_CHECKED, // INDETERMINATE, ALL_CHECKED
} from './DeleteSelectedPageGroup';

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

  const onCheckAllPagesInvoked = () => {
    console.log('onCheckAllPagesInvoked is called');
    // Todo: set the checkboxState, isChecked, and indeterminate value of checkbox element according to the passed argument
    // https://estoc.weseek.co.jp/redmine/issues/77525

    // setting checkbox to indeterminate is required to use of useRef to access checkbox element.
    // ref: https://getbootstrap.com/docs/4.5/components/forms/#checkboxes
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
          isChecked={false || false} // Todo: change the left value to appropriate value based on checkboxState
          checkboxState={'' || NONE_CHECKED} // Todo: change the left value to appropriate value
          onClickInvoked={onDeleteSelectedPageHandler}
          onCheckInvoked={onCheckAllPagesInvoked}
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
