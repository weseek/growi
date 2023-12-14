import React, {
  useState, useCallback, useEffect,
} from 'react';

import { PagePathLabel, UserPicture } from '@growi/ui/dist/components';
import Downshift from 'downshift';
import { useTranslation } from 'next-i18next';
import { Modal, ModalBody } from 'reactstrap';
import { useDebounce } from 'usehooks-ts';

import { useCurrentPagePath } from '~/stores/page';
import { useSWRxSearch } from '~/stores/search';

import { useSearchModal } from '../stores/search';


import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';

type ComponentType = 'nomal' | 'tree' | 'exact';

type SearchMenuItemProps = {
  componentType: ComponentType
  index: number
  highlightedIndex: number | null
  getItemProps: any
  searchKeyword: string
}

const SearchMethodMenuItem = (props: SearchMenuItemProps): JSX.Element => {
  const {
    componentType, getItemProps, index, highlightedIndex, searchKeyword,
  } = props;
  const { t } = useTranslation('commons');
  const { data: currentPagePath } = useCurrentPagePath();

  const option = {
    key: componentType,
    index,
    item: {},
    className: 'mb-2 d-flex',
    style: { backgroundColor: highlightedIndex === index ? 'lightgray' : 'white', pointer: 'cursor' },
  };

  if (componentType === 'nomal') {
    return (
      <li key={componentType} className="text-muted d-flex" {...getItemProps(option)}>
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        <span>{searchKeyword}</span>
        <div className="ms-auto">
          <span>{t('search_method_menu_item.search_in_all')}</span>
        </div>
      </li>
    );
  }

  if (componentType === 'tree') {
    return (
      <li key={componentType} className="text-muted d-flex" {...getItemProps(option)}>
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        <code>prefix: {currentPagePath}</code>
        <span className="ms-2">{searchKeyword}</span>
        <div className="ms-auto">
          <span>{t('search_method_menu_item.only_children_of_this_tree')}</span>
        </div>
      </li>
    );
  }

  if (componentType === 'exact') {
    return (
      <li key={componentType} className="text-muted d-flex" {...getItemProps(option)}>
        <span className="material-symbols-outlined fs-4 me-3">search</span>
        <span>{`"${searchKeyword}"`}</span>
        <div className="ms-auto">
          <span>{t('search_method_menu_item.exact_mutch')}</span>
        </div>
      </li>
    );
  }

  return (<></>);
};


const SearchModal = (): JSX.Element => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  const changeSearchTextHandler = useCallback((searchText: string) => {
    setSearchKeyword(searchText);
  }, []);

  const clickClearButtonHandler = useCallback(() => {
    setSearchKeyword('');
  }, []);


  const debouncedKeyword = useDebounce(searchKeyword, 500);

  // const isEmptyKeyword = debouncedKeyword.trim() === '';
  const isSearchable = searchKeyword.length !== 0;

  const { data: searchResult, isLoading } = useSWRxSearch(isSearchable ? searchKeyword : null, null, { limit: 10 });

  const searchMethodMenuItemData: Array<{ componentType: ComponentType }> = isSearchable
    ? [{ componentType: 'nomal' }, { componentType: 'tree' }, { componentType: 'exact' }]
    : [{ componentType: 'tree' }];


  const getFiexdIndex = (index: number) => {
    return index + searchMethodMenuItemData.length;
  };

  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchKeyword('');
    }
  }, [searchModalData?.isOpened]);


  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <Downshift>
          {({
            getInputProps,
            getItemProps,
            getMenuProps,
            highlightedIndex,
          }) => (
            <div>

              {/* SearchForm */}
              <div className="text-muted d-flex justify-content-center align-items-center">
                <span className="material-symbols-outlined fs-4 me-3">search</span>

                <input
                  {...getInputProps({
                    type: 'search',
                    className: 'form-control',
                    placeholder: 'Search...',
                    onChange(e: React.ChangeEvent<HTMLInputElement>) {
                      changeSearchTextHandler(e.target.value);
                    },
                  })}
                />

                <button
                  type="button"
                  className="btn border-0 d-flex justify-content-center p-0"
                  onClick={clickClearButtonHandler}
                >
                  <span className="material-symbols-outlined fs-4 ms-3">close</span>
                </button>
              </div>


              {/* SearchMethodMenuItem */}
              <ul {...getMenuProps()} className="list-unstyled mt-3">
                { searchMethodMenuItemData.map((item, index) => (
                  <SearchMethodMenuItem
                    componentType={item.componentType}
                    getItemProps={getItemProps}
                    index={index}
                    highlightedIndex={highlightedIndex}
                    searchKeyword={debouncedKeyword}
                  />
                ))}
              </ul>


              {/* SearchResultMenuItem */}
              { isSearchable && (
                <ul {...getMenuProps()} className="list-unstyled mt-3">
                  {searchResult?.data
                    .map((item, index) => (
                      <li
                        {...getItemProps({
                          key: item.data._id,
                          index: getFiexdIndex(index),
                          item: {},
                          className: 'mb-2 d-flex',
                          style: { backgroundColor: highlightedIndex === getFiexdIndex(index) ? 'lightgray' : 'white', pointer: 'cursor' },
                        })}
                      >
                        <UserPicture user={item.data.creator} />

                        <span className="ms-3 text-break text-wrap">
                          <PagePathLabel path={item.data.path} />
                        </span>

                        <span className="ms-2 text-muted d-flex justify-content-center align-items-center">
                          <span className="material-symbols-outlined fs-5">footprint</span>
                          <span>{item.data.seenUsers.length}</span>
                        </span>
                      </li>
                    ))
                  }
                </ul>

              )}
            </div>
          )}
        </Downshift>
        <SearchHelp />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
