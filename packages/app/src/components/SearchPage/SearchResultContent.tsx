import React, {
  FC, useCallback, useEffect,
} from 'react';

import { DropdownItem } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';

import { exportAsMarkdown } from '~/client/services/page-operation';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import { GrowiSubNavigation } from '../Navbar/GrowiSubNavigation';
import { SubNavButtons } from '../Navbar/SubNavButtons';
import { AdditionalMenuItemsRendererProps } from '../Common/Dropdown/PageItemControl';

import { usePageDeleteModal } from '~/stores/ui';


type AdditionalMenuItemsProps = AdditionalMenuItemsRendererProps & {
  pageId: string,
  revisionId: string,
}

const AdditionalMenuItems = (props: AdditionalMenuItemsProps): JSX.Element => {
  const { t } = useTranslation();

  const { pageId, revisionId } = props;

  return (
    <>
      <DropdownItem divider />

      {/* Export markdown */}
      <DropdownItem onClick={() => exportAsMarkdown(pageId, revisionId, 'md')}>
        <i className="icon-fw icon-cloud-download"></i>
        {t('export_bulk.export_page_markdown')}
      </DropdownItem>
    </>
  );
};

const SCROLL_OFFSET_TOP = 175; // approximate height of (navigation + subnavigation)
const MUTATION_OBSERVER_CONFIG = { childList: true, subtree: true };

type Props ={
  appContainer: AppContainer,
  searchingKeyword:string,
  focusedSearchResultData : IPageWithMeta<IPageSearchMeta>,
  showPageControlDropdown?: boolean,
}

const SearchResultContent: FC<Props> = (props: Props) => {

  // ***************************  Auto Scroll  ***************************
  const scrollTo = (scrollElement:HTMLElement) => {
    const highlightedKeyword = scrollElement.querySelector('.highlighted-keyword') as HTMLElement;
    if (highlightedKeyword != null) {
      smoothScrollIntoView(highlightedKeyword, SCROLL_OFFSET_TOP, scrollElement);
    }
  };

  useEffect(() => {
    const scrollElement = document.querySelector('.search-result-page-content') as HTMLElement;
    if (scrollElement == null) return;
    const observerCallback = (mutationRecords) => {
      mutationRecords.forEach((record) => {
        const targetId = record.target.id;
        if (targetId !== 'wiki') return;
        scrollTo(scrollElement);
      });
    };
    const observer = new MutationObserver(observerCallback);
    observer.observe(scrollElement, MUTATION_OBSERVER_CONFIG);
    return () => {
      observer.disconnect();
    };
  });
  // ***************************  end  ***************************

  const {
    appContainer,
    focusedSearchResultData,
    showPageControlDropdown,
  } = props;

  const { open: openDeleteModal } = usePageDeleteModal();

  const page = focusedSearchResultData?.pageData;

  const growiRenderer = appContainer.getRenderer('searchresult');


  const deleteItemClickedHandler = useCallback(async(pageToDelete) => {
    openDeleteModal([pageToDelete]);
  }, [openDeleteModal]);

  const ControlComponents = useCallback(() => {
    if (page == null) {
      return <></>;
    }

    const revisionId = typeof page.revision === 'string'
      ? page.revision
      : page.revision._id;

    return (
      <>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
          <SubNavButtons
            pageId={page._id}
            revisionId={revisionId}
            path={page.path}
            showPageControlDropdown={showPageControlDropdown}
            additionalMenuItemRenderer={props => <AdditionalMenuItems {...props} pageId={page._id} revisionId={revisionId} />}
            onClickDeleteMenuItem={deleteItemClickedHandler}
          />
        </div>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
        </div>
      </>
    );
  }, [page, showPageControlDropdown, deleteItemClickedHandler]);

  // return if page is null
  if (page == null) return <></>;

  return (
    <div key={page._id} className="search-result-page grw-page-path-text-muted-container d-flex flex-column">
      <GrowiSubNavigation
        page={page}
        controls={ControlComponents}
      />
      <div className="search-result-page-content">
        <RevisionLoader
          growiRenderer={growiRenderer}
          pageId={page._id}
          pagePath={page.path}
          revisionId={page.revision}
          highlightKeywords={props.searchingKeyword}
        />
      </div>
    </div>
  );
};


export default SearchResultContent;
