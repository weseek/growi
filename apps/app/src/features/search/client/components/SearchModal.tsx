import React, {
  useState, useCallback, useEffect,
} from 'react';

import Downshift from 'downshift';
import { useRouter } from 'next/router';
import { Modal, ModalBody } from 'reactstrap';

import type { DownshiftItem } from '../interfaces/downshift';
import { useSearchModal } from '../stores/search';

import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';
import { SearchMethodMenuItem } from './SearchMethodMenuItem';
import { SearchResultMenuItem } from './SearchResultMenuItem';

const SearchModal = (): JSX.Element => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  const router = useRouter();

  const changeSearchTextHandler = useCallback((searchText: string) => {
    setSearchKeyword(searchText);
  }, []);

  const clickClearButtonHandler = useCallback(() => {
    setSearchKeyword('');
  }, []);

  const selectSearchMenuItemHandler = useCallback((url: string) => {
    router.push(url);
    closeSearchModal();
  }, [closeSearchModal, router]);

  const enterKeyDownHandler = useCallback(() => {
    router.push(`/_search?q=${searchKeyword}`);
    closeSearchModal();
  }, [closeSearchModal, router, searchKeyword]);

  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchKeyword('');
    }
  }, [searchModalData?.isOpened]);

  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <Downshift
          onSelect={(selectedItem: DownshiftItem) => { selectSearchMenuItemHandler(selectedItem.url) }}
        >
          {({
            getInputProps,
            getItemProps,
            getMenuProps,
            highlightedIndex,
          }) => (
            <div>
              <SearchForm
                highlightedIndex={highlightedIndex}
                searchKeyword={searchKeyword}
                onChangeSearchText={changeSearchTextHandler}
                onClickClearButton={clickClearButtonHandler}
                onEnterKeyDownHandler={enterKeyDownHandler}
                getInputProps={getInputProps}
              />

              <ul {...getMenuProps()} className="list-unstyled">
                <div className="border-top mt-3 mb-3" />
                <SearchMethodMenuItem searchKeyword={searchKeyword} getItemProps={getItemProps} highlightedIndex={highlightedIndex} />
                <div className="border-top mt-3 mb-3" />
                <SearchResultMenuItem searchKeyword={searchKeyword} getItemProps={getItemProps} highlightedIndex={highlightedIndex} />
              </ul>
            </div>
          )}
        </Downshift>
        <SearchHelp />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
