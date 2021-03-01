import React, { FC } from 'react';

import { useSearchResultRenderer } from '~/stores/renderer';
import { Page } from '~/interfaces/page';

import RevisionLoader from '../Page/RevisionLoader';

type Props = {
  pages: Page[],
  searchingKeyword: string,
}

const SearchResultList: FC<Props> = ({ pages, searchingKeyword }: Props) => {
  const { data: renderer } = useSearchResultRenderer();

  return (
    <>
      { pages.map((page) => {
        const showTags = (page.tags != null) && (page.tags.length > 0);

        return (
          // Add prefix 'id_' in id attr, because scrollspy of bootstrap doesn't work when the first letter of id of target component is numeral.
          <div id={`id_${page._id}`} key={page._id} className="search-result-page mb-5">
            <h2>
              <a href={page.path} className="text-break">{page.path}</a>
              { showTags && (
                <div className="mt-1 small"><i className="tag-icon icon-tag"></i> {page.tags.join(', ')}</div>
              )}
            </h2>
            <RevisionLoader
              renderer={renderer}
              pageId={page._id}
              pagePath={page.path}
              revisionId={page.revision}
              highlightKeywords={searchingKeyword}
            />
          </div>
        );
      }) }
    </>
  );

};

export default SearchResultList;
