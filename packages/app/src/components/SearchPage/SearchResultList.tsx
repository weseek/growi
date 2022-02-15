import React, {
  forwardRef,
  ForwardRefRenderFunction, useCallback, useImperativeHandle, useRef,
} from 'react';
import { ISelectable, ISelectableAll } from '~/client/interfaces/selectable-all';
import { IPageWithMeta, isIPageInfoForListing } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';
import { useIsGuestUser } from '~/stores/context';
import { useSWRxPageInfoForList } from '~/stores/page';

import { PageListItemL } from '../PageList/PageListItemL';


type Props = {
  pages: IPageWithMeta<IPageSearchMeta>[],
  selectedPageId?: string,
  onPageSelected?: (page?: IPageWithMeta<IPageSearchMeta>) => void,
  onCheckboxChanged?: (isChecked: boolean, pageId: string) => void,
}

const SearchResultListSubstance: ForwardRefRenderFunction<ISelectableAll, Props> = (props:Props, ref) => {
  const {
    pages, selectedPageId,
    onPageSelected,
  } = props;

  const pageIdsWithNoSnippet = pages
    .filter(page => (page.pageMeta?.elasticSearchResult?.snippet.length ?? 0) === 0)
    .map(page => page.pageData._id);

  const { data: isGuestUser } = useIsGuestUser();
  const { data: idToPageInfo } = useSWRxPageInfoForList(pageIdsWithNoSnippet);

  const itemsRef = useRef<(ISelectable|null)[]>([]);

  // publish selectAll()
  useImperativeHandle(ref, () => ({
    selectAll: () => {
      const items = itemsRef.current;
      if (items != null) {
        items.forEach(item => item != null && item.select());
      }
    },
    deselectAll: () => {
      const items = itemsRef.current;
      if (items != null) {
        items.forEach(item => item != null && item.deselect());
      }
    },
  }));

  const clickItemHandler = useCallback((pageId: string) => {
    if (onPageSelected != null) {
      const selectedPage = pages.find(page => page.pageData._id === pageId);
      onPageSelected(selectedPage);
    }
  }, [onPageSelected, pages]);


  let injectedPage;
  // inject data to list
  if (idToPageInfo != null) {
    injectedPage = pages.map((page) => {
      const pageInfo = idToPageInfo[page.pageData._id];

      if (!isIPageInfoForListing(pageInfo)) {
        // return as is
        return page;
      }

      return {
        pageData: page.pageData,
        pageMeta: {
          ...page.pageMeta,
          revisionShortBody: pageInfo.revisionShortBody,
        },
      };
    });
  }

  return (
    <ul className="page-list-ul list-group list-group-flush">
      { (injectedPage ?? pages).map((page, i) => {
        return (
          <PageListItemL
            key={page.pageData._id}
            // eslint-disable-next-line no-return-assign
            ref={c => itemsRef.current[i] = c}
            page={page}
            isEnableActions={!isGuestUser}
            isSelected={page.pageData._id === selectedPageId}
            onClickItem={clickItemHandler}
            onCheckboxChanged={props.onCheckboxChanged}
          />
        );
      })}
    </ul>
  );

};

export const SearchResultList = forwardRef(SearchResultListSubstance);
