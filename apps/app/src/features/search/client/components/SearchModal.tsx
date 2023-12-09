import React, { useState, useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';
import { Modal, ModalBody, ListGroup } from 'reactstrap';

import { useSearchModal } from '../stores/search';

import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';
import { SearchMethodMenuItem } from './SearchMethodMenuItem';
import { SearchResultMenuItem } from './SearchResultMenuItem';

const SearchModal = (): JSX.Element => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  const router = useRouter();

  const changeSearchTextHandler = useCallback((searchText: string) => {
    setSearchKeyword(searchText);
  }, []);

  const clickClearButtonHandler = useCallback(() => {
    setSearchKeyword('');
  }, []);

  const getUpdatedActiveIndex = useCallback((activeIndex: number, menuItemsLength: number, arrowKey: 'ArrowUp' | 'ArrowDown'): number => {
    const newIndex = arrowKey === 'ArrowUp' ? activeIndex - 1 : activeIndex + 1;
    if (newIndex < -1) {
      return menuItemsLength - 1;
    }

    if (newIndex > menuItemsLength) {
      return 0;
    }

    return newIndex;
  }, []);

  const arrorKeydownHandler = useCallback((arrowKey: 'ArrowUp' | 'ArrowDown') => {
    // get all menu items
    const menuItemsElm = document.getElementById('search-menu')?.getElementsByClassName('list-group-item');
    const menuItemsLength = menuItemsElm?.length ?? 0;

    // remove active class of MenuItem of old activeIndex
    menuItemsElm?.[activeIndex]?.classList.remove('active');

    // add active class of MenuItem the new activeIndex
    const newActiveIndex = getUpdatedActiveIndex(activeIndex, menuItemsLength, arrowKey);
    menuItemsElm?.[newActiveIndex]?.classList.add('active');
    setActiveIndex(newActiveIndex);

  }, [activeIndex, getUpdatedActiveIndex]);

  const enterKeyDownHandler = useCallback(() => {
    const activeMenuItem = document.getElementById('search-menu')?.getElementsByClassName('list-group-item active')[0];

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
        arrorKeydownHandler(event.key);
        break;
      default:
        break;
    }
  }, [arrorKeydownHandler, enterKeyDownHandler]);

  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchKeyword('');
      setActiveIndex(-1);
    }
  }, [searchModalData?.isOpened]);

  // remove all active class
  useEffect(() => {
    const menuItemsElm = document.getElementById('search-menu')?.getElementsByClassName('list-group-item');
    const menuItemsElmArray = Array.from(menuItemsElm ?? []);
    menuItemsElmArray.forEach((elm) => {
      elm.classList.remove('active');
    });

    setActiveIndex(-1);
  }, [searchKeyword]);

  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <SearchForm
          searchKeyword={searchKeyword}
          onChangeSearchText={changeSearchTextHandler}
          onClickClearButton={clickClearButtonHandler}
          onKeydownHandler={keydownHandler}
        />

        <ListGroup id="search-menu">
          <div className="border-top mt-3 mb-2" />
          <SearchMethodMenuItem searchKeyword={searchKeyword} />
          <div className="border-top mt-2 mb-2" />
          <SearchResultMenuItem searchKeyword={searchKeyword} />
        </ListGroup>

        <SearchHelp />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
