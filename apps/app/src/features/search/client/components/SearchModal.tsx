
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

  const selectSearchMenuItemHandler = useCallback((selectedItem: DownshiftItem) => {
    router.push(selectedItem.url);
    closeSearchModal();
  }, [closeSearchModal, router]);

  const submitHandler = useCallback(() => {
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
          onSelect={selectSearchMenuItemHandler}
          defaultIsOpen
        >
          {({
            getRootProps,
            getInputProps,
            getItemProps,
            getMenuProps,
            highlightedIndex,
            setHighlightedIndex,
          }) => (
            <div {...getRootProps({}, { suppressRefError: true })}>
              <div className="text-muted d-flex justify-content-center align-items-center">
                <span className="material-symbols-outlined fs-4 me-3">search</span>
                <SearchForm
                  searchKeyword={searchKeyword}
                  onChange={changeSearchTextHandler}
                  onSubmit={submitHandler}
                  getInputProps={getInputProps}
                />
                <button
                  type="button"
                  className="btn border-0 d-flex justify-content-center p-0"
                  onClick={closeSearchModal}
                >
                  <span className="material-symbols-outlined fs-4 ms-3">close</span>
                </button>
              </div>

              {/* see: https://github.com/downshift-js/downshift/issues/582#issuecomment-423592531 */}
              <ul {...getMenuProps({ onMouseLeave: () => { setHighlightedIndex(-1) } })} className="list-unstyled">
                <div className="border-top mt-3 mb-3" />
                <SearchMethodMenuItem
                  highlightedIndex={highlightedIndex}
                  searchKeyword={searchKeyword}
                  getItemProps={getItemProps}
                />
                <div className="border-top mt-3 mb-3" />
                <SearchResultMenuItem
                  highlightedIndex={highlightedIndex}
                  searchKeyword={searchKeyword}
                  getItemProps={getItemProps}
                />
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
