import React, {
  useState, useCallback, useEffect,
} from 'react';

import { Modal, ModalBody } from 'reactstrap';

import { useSearchModal } from '../stores/search';

import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';

const SearchModal = (): JSX.Element => {
  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  const [searchText, setSearchText] = useState('');

  const changeSearchTextHandler = useCallback((searchText: string) => {
    setSearchText(searchText);
  }, []);

  const clickClearButtonHandler = useCallback(() => {
    setSearchText('');
  }, []);

  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchText('');
    }
  }, [searchModalData?.isOpened]);

  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <SearchForm
          searchText={searchText}
          onChangeSearchText={changeSearchTextHandler}
          onClickClearButton={clickClearButtonHandler}
        />
        <div className="border-top mt-4 mb-3" />
        <SearchHelp />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
