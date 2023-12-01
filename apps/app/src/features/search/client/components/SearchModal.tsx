import React, {
  useState, useCallback, useEffect,
} from 'react';

import { Modal, ModalBody } from 'reactstrap';

import { useSearchModal } from '../stores/search';

import { SearchButtons } from './SearchButtons';
import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';

const SearchModal = (): JSX.Element => {
  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  const [searchKeyword, setSearchKeyword] = useState('');

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
        <div className="border-top mt-3 mb-3" />
        <SearchButtons searchText={searchText} />
        <div className="border-top mt-2 mb-2" />
        <SearchHelp />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
