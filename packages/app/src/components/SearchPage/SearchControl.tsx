import React, { FC } from 'react';
import SearchPageForm from './SearchPageForm';
import { specificPathNames } from '../../client/util/search/path';
import AppContainer from '../../client/services/AppContainer';


type Props = {
  searchingKeyword: string,
  appContainer: AppContainer,
  onSearchInvoked: (data : any[]) => boolean,
  toggleIncludedSpecificPath: (pathType: string) => void,
}

const SearchControl: FC <Props> = (props: Props) => {
  // Temporaly workaround for lint error
  // later needs to be fixed: SearchControl to typescript componet
  const SearchPageFormTypeAny : any = SearchPageForm;
  return (
    <div className="">
      <div className="search-page-input sps sps--abv">
        <SearchPageFormTypeAny
          keyword={props.searchingKeyword}
          appContainer={props.appContainer}
          onSearchFormChanged={props.onSearchInvoked}
        />
      </div>
      {/* TODO: place the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="d-flex my-4">
        <div className="form-check border-gray">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckDefault"
            onClick={() => props.toggleIncludedSpecificPath(specificPathNames.user)}
          />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            /user下を含む
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckChecked"
            onClick={() => props.toggleIncludedSpecificPath(specificPathNames.trash)}
          />
          <label className="form-check-label" htmlFor="flexCheckChecked">
            /trash下を含む
          </label>
        </div>
      </div>
    </div>
  );
};


export default SearchControl;
