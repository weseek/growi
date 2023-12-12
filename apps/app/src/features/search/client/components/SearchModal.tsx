import React, {
  useState, useCallback, useEffect,
} from 'react';

import { PagePathLabel, UserPicture } from '@growi/ui/dist/components';
import {
  AsyncTypeahead, Typeahead, Menu, MenuItem, useItem, withItem, TypeaheadMenu,
} from 'react-bootstrap-typeahead6';
import { Modal, ModalBody, ListGroupItem } from 'reactstrap';
import { useDebounce } from 'usehooks-ts';
import { option } from 'yargs';

import { IPageWithSearchMeta } from '~/interfaces/search';
import { useSWRxSearch } from '~/stores/search';

import { useSearchModal } from '../stores/search';

import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';

const SearchResultMenuItem = (props: {pageWithMeta: IPageWithSearchMeta}) => {
  const { pageWithMeta } = props;
  return (
    <div className="ps-1 mb-2 d-flex">
      <UserPicture user={pageWithMeta.data.creator} />

      <span className="ms-3 text-break text-wrap">
        <PagePathLabel path={pageWithMeta.data.path} />
      </span>

      <span className="ms-2 text-muted d-flex justify-content-center align-items-center">
        <span className="material-symbols-outlined fs-5">footprint</span>
        <span>{pageWithMeta.data.seenUsers.length}</span>
      </span>
    </div>
  );
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
  const isEmptyKeyword = debouncedKeyword.trim() === '';
  const { data: searchResult, isLoading } = useSWRxSearch(isEmptyKeyword ? null : searchKeyword, null, { limit: 10 });

  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchKeyword('');
    }
  }, [searchModalData?.isOpened]);

  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <AsyncTypeahead
          open
          autoFocus
          id="search-form"
          isLoading={isLoading}
          onSearch={() => {}}
          onInputChange={changeSearchTextHandler}
          options={searchResult?.data ?? []}
          labelKey={(pageWithMeta: IPageWithSearchMeta) => pageWithMeta?.data?.path}
          renderMenu={(results, props) => (
            <Menu id="sarach-menu" {...props} className="list-group mt-5">
              <MenuItem position={0} onClick={() => { console.log('hoge') }}>
                検索ボタン1
              </MenuItem>

              <MenuItem position={1}>
                検索ボタン2
              </MenuItem>

              <MenuItem position={2}>
                検索ボタン3
              </MenuItem>

              {results.map((option: IPageWithSearchMeta, position) => {
                // const fixedPosition = searchKeyword.trim().length === 0 ? position + 1 : position + 3;
                const fixedPosition = position + 3;
                return (
                  <>
                    <MenuItem option={option} position={fixedPosition}>
                      <SearchResultMenuItem pageWithMeta={option} />
                    </MenuItem>
                  </>
                );
              })}
            </Menu>
          )}
        />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
