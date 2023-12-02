import React, {
  useState, useCallback, useEffect,
} from 'react';

import { Modal, ModalBody } from 'reactstrap';

import { useSWRxSearch } from '~/stores/search';

import { useSearchModal } from '../stores/search';

import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';
import { SearchResultMenuItem } from './SearchResultMenuItem';

const SearchModal = (): JSX.Element => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: searchModalData, close: closeSearchModal } = useSearchModal();
  const { data: searchResult } = useSWRxSearch(searchKeyword, null, { limit: 10 });

  const changeSearchTextHandler = useCallback((searchText: string) => {
    setSearchKeyword(searchText);
  }, []);

  const clickClearButtonHandler = useCallback(() => {
    setSearchKeyword('');
  }, []);

  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchKeyword('');
    }
  }, [searchModalData?.isOpened]);

  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <SearchForm
          searchKeyword={searchKeyword}
          onChangeSearchText={changeSearchTextHandler}
          onClickClearButton={clickClearButtonHandler}
        />
        <div className="border-top mt-4 mb-3" />
        <SearchResultMenuItem searchResult={searchResult} />
        <SearchHelp />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
