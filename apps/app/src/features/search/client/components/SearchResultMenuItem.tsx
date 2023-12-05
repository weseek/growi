import React from 'react';

import { PagePathLabel, UserPicture } from '@growi/ui/dist/components';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { useDebounce } from 'usehooks-ts';

import { useSWRxSearch } from '~/stores/search';


type Props = {
  searchKeyword: string,
}

export const SearchResultMenuItem = (props: Props): JSX.Element => {
  const { searchKeyword } = props;

  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const isEmptyKeyword = debouncedKeyword.trim() === '';

  const { data: searchResult } = useSWRxSearch(isEmptyKeyword ? null : searchKeyword, null, { limit: 10 });

  if (isEmptyKeyword || searchResult == null || searchResult.data.length === 0) {
    return <></>;
  }

  return (
    <>
      <ListGroup>
        {searchResult.data?.map(pageWithMeta => (
          <ListGroupItem key={pageWithMeta.data._id} className='border-0 text-muted p-1 d-flex"'>
            <div className="mb-1 d-flex">
              <UserPicture user={pageWithMeta.data.creator} />

              <span className="ms-3 text-break text-wrap">
                <PagePathLabel path={pageWithMeta.data.path} />
              </span>

              <span className="ms-2 text-muted d-flex justify-content-center align-items-center">
                <span className="material-symbols-outlined fs-5">footprint</span>
                <span>{pageWithMeta.data.seenUsers.length}</span>
              </span>
            </div>
          </ListGroupItem>
        ))}
      </ListGroup>
      <div className="border-top mb-2" />
    </>
  );
};
