import React, {
  useState, useCallback, useEffect,
} from 'react';

import Select, { components, SelectComponentsConfig } from 'react-select';
import AsyncSelect from 'react-select/async';
import { Modal, ModalBody } from 'reactstrap';
import { useDebounce } from 'usehooks-ts';

import { useSWRxSearch } from '~/stores/search';

import { useSearchModal } from '../stores/search';

import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';
import { SearchMethodMenuItem } from './SearchMethodMenuItem';
import { SearchResultMenuItem } from './SearchResultMenuItem';


const SearchModal = (): JSX.Element => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  const changeSearchTextHandler = useCallback((searchText: string) => {
    setSearchKeyword(searchText);
  }, []);

  const clickClearButtonHandler = useCallback(() => {
    setSearchKeyword('');
  }, []);


  // search result
  // -----------------------------------------------------------------------------------------------------------------------------------------------
  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const isEmptyKeyword = debouncedKeyword.trim() === '';

  const { data: searchResult, isLoading } = useSWRxSearch(isEmptyKeyword ? null : searchKeyword, null, { limit: 10 });
  // const options = searchResult?.data.map(pageWithMeta => ({ label: pageWithMeta.data.path }));


  // -----------------------------------------------------------------------------------------------------------------------------------------------


  // search method
  // -----------------------------------------------------------------------------------------------------------------------------------------------

  // -----------------------------------------------------------------------------------------------------------------------------------------------


  // react-select settings
  // -----------------------------------------------------------------------------------------------------------------------------------------------

  // const components = {
  //   IndicatorSeparator: () => null,
  //   IndicatorsContainer: () => null,
  //   DropdownIndicator: () => null,
  //   MenuList: (props) => {
  //     return (
  //       <components.MenuList {...props}>
  //         <SearchMethodMenuItem searchKeyword={searchKeyword} />
  //         <SearchResultMenuItem searchKeyword={searchKeyword} />
  //       </components.MenuList>
  //     );
  //   },
  // };
  // -----------------------------------------------------------------------------------------------------------------------------------------------


  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchKeyword('');
    }
  }, [searchModalData?.isOpened]);

  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <Select
          autoFocus
          menuIsOpen
          components={{
            MenuList: (props) => {
              return (
                <components.MenuList {...props}>
                  <SearchMethodMenuItem searchKeyword={searchKeyword} />
                  <SearchResultMenuItem searchKeyword={searchKeyword} />
                </components.MenuList>
              );
            },
          }}
          placeholder="Search..."
          onInputChange={(value) => { setSearchKeyword(value) }}
        >
        </Select>
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
