import React from 'react';

import { PagePathLabel, UserPicture } from '@growi/ui/dist/components';

import type { IFormattedSearchResult } from '~/interfaces/search';


type Props = {
  searchResult?: IFormattedSearchResult
}
export const SearchResultMenuItem = (props: Props): JSX.Element => {
  const { searchResult } = props;

  if (searchResult == null || searchResult.data.length === 0) {
    return <></>;
  }

  return (
    <>
      <table>
        <tbody>
          {searchResult.data?.map(pageWithMeta => (
            <tr key={pageWithMeta.data._id}>
              <div className="ps-1 mb-2">
                <UserPicture />
                <span className="ms-3 text-break text-wrap"><PagePathLabel path={pageWithMeta.data.path} /></span>
                <span className="ms-3">{pageWithMeta.data.seenUsers.length}</span>
              </div>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-top mt-2 mb-2" />
    </>
  );
};
