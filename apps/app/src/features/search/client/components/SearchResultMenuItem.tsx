import React from 'react';

import { PagePathLabel, UserPicture } from '@growi/ui/dist/components';
import { useRouter } from 'next/router';
import { ListGroupItem } from 'reactstrap';
import { useDebounce } from 'usehooks-ts';

import { useSWRxSearch } from '~/stores/search';


type Props = {
  searchKeyword: string,
}

export const SearchResultMenuItem = (props: Props): JSX.Element => {
  const { searchKeyword } = props;

  const router = useRouter();

  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const isEmptyKeyword = debouncedKeyword.trim() === '';

  const { data: searchResult } = useSWRxSearch(isEmptyKeyword ? null : searchKeyword, null, { limit: 10 });

  if (isEmptyKeyword || searchResult == null || searchResult.data.length === 0) {
    return <></>;
  }

  return (
    <>
      <>
        {searchResult.data?.map(pageWithMeta => (
          <ListGroupItem
            key={pageWithMeta.data._id}
            tag="a"
            className="border-0 text-muted p-1 d-flex"
            href={pageWithMeta.data._id}
            onClick={() => { router.push(pageWithMeta.data._id) }}
          >
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
      </>
      <div className="border-top mb-2" />
    </>
  );
};
