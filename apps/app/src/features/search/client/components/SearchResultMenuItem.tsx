import React from 'react';

import { PagePathLabel, UserPicture } from '@growi/ui/dist/components';
import { useDebounce } from 'usehooks-ts';

import { useSWRxSearch } from '~/stores/search';


type Props = {
  searchKeyword: string,
}
export const SearchResultMenuItem = (props: Props): JSX.Element => {
  const { searchKeyword } = props;

  const debouncedKeyword = useDebounce(searchKeyword, 500);

  const isEmptyKeyword = debouncedKeyword.trim() === '';

  const { data: searchResult, isLoading } = useSWRxSearch(isEmptyKeyword ? null : searchKeyword, null, { limit: 10 });

  if (isLoading) {
    return (
      <>
        Searching...
        <div className="border-top mt-2" />
      </>
    );
  }

  if (isEmptyKeyword || searchResult == null || searchResult.data.length === 0) {
    return <></>;
  }

  return (
    <>
      <table>
        <tbody>
          {searchResult.data?.map(pageWithMeta => (
            <tr key={pageWithMeta.data._id}>
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
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-top mb-2" />
    </>
  );
};
