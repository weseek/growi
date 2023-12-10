import React, { useState, useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';
import { Modal, ModalBody, ListGroup } from 'reactstrap';

import { useSearchModal } from '../stores/search';

import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';
import { SearchMethodMenuItem } from './SearchMethodMenuItem';
import { SearchResultMenuItem } from './SearchResultMenuItem';


type ArrowKey = 'ArrowUp' | 'ArrowDown';
const SearchModal = (): JSX.Element => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  const router = useRouter();

  const changeSearchKeywordHandler = useCallback((searchText: string) => {
    setSearchKeyword(searchText);
  }, []);

  const clickClearButtonHandler = useCallback(() => {
    setSearchKeyword('');
  }, []);

  const getUpdatedActiveIndex = useCallback((activeIndex: number, menuItemsLength: number, arrowKey: ArrowKey): number => {
    const newIndex = arrowKey === 'ArrowUp' ? activeIndex - 1 : activeIndex + 1;
    if (newIndex < -1) {
      return menuItemsLength - 1;
    }

    if (newIndex > menuItemsLength) {
      return 0;
    }

    return newIndex;
  }, []);

  const arrowKeydownHandler = useCallback((arrowKey: ArrowKey) => {
    // Get all search-menu-item
    const menuItemElements = document.getElementsByClassName('search-menu-item');
    const menuItemsLength = menuItemElements?.length ?? 0;

    // Remove the active class from the MenuItem with the old activeIndex
    menuItemElements?.[activeIndex]?.classList.remove('active');

    // Add the active class to the MenuItem with the new activeIndex
    const newActiveIndex = getUpdatedActiveIndex(activeIndex, menuItemsLength, arrowKey);
    menuItemElements?.[newActiveIndex]?.classList.add('active');
    setActiveIndex(newActiveIndex);

  }, [activeIndex, getUpdatedActiveIndex]);

  const enterKeyDownHandler = useCallback(() => {
    const activeMenuItem = document.getElementsByClassName('search-menu-item active')[0];

    if (activeMenuItem != null) {
      const url = activeMenuItem.getAttribute('href');
      if (url != null) {
        router.push(url);
        closeSearchModal();
      }
      return;
    }

    if (activeMenuItem == null && searchKeyword.trim() !== '') {
      router.push(`/_search?q=${searchKeyword}`);
      closeSearchModal();
    }
  }, [closeSearchModal, router, searchKeyword]);

  const keydownHandler = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        enterKeyDownHandler();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        arrowKeydownHandler(event.key);
        break;
      default:
        break;
    }
  }, [arrowKeydownHandler, enterKeyDownHandler]);

  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchKeyword('');
      setActiveIndex(-1);
    }
  }, [searchModalData?.isOpened]);

  // Clear active Index when SearchKeyword changes
  useEffect(() => {
    setActiveIndex(-1);

    const allActiveMenuItemElements = document.getElementsByClassName('search-menu-item active');
    const allActiveMenuItemElementsArray = Array.from(allActiveMenuItemElements ?? []);

    if (allActiveMenuItemElementsArray.length === 0) {
      return;
    }

    allActiveMenuItemElementsArray.forEach((elm) => {
      elm.classList.remove('active');
    });
  }, [searchKeyword]);

  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <SearchForm
          searchKeyword={searchKeyword}
          onChangeSearchKeyword={changeSearchKeywordHandler}
          onClickClearButton={clickClearButtonHandler}
          onKeydownHandler={keydownHandler}
        />

        <ListGroup>
          <div className="border-top mt-3 mb-2" />
          <SearchMethodMenuItem searchKeyword={searchKeyword} onClickMenuItem={closeSearchModal} />
          <div className="border-top mt-2 mb-2" />
          <SearchResultMenuItem searchKeyword={searchKeyword} onClickMenuItem={closeSearchModal} />
        </ListGroup>

        <SearchHelp />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
