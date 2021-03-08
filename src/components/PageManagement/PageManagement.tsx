import React, { useState, FC } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import urljoin from 'url-join';

import dynamic from 'next/dynamic';
import { useTranslation } from '~/i18n';
import { isTopPage, isDeletablePage } from '~/utils/path-utils';
import { useCurrentPagePath, useCurrentUser, useIsAbleToDeleteCompletely } from '~/stores/context';
import { useCurrentPageSWR } from '~/stores/page';

import { PresentationIcon } from '~/components/Icons/PresentationIcon';

type Props = {
  isCompactMode?: boolean,
}

const PageManagementButton: FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const { isCompactMode } = props;

  const ButtonForCurrentUser: FC = () => {
    return (
      <>
        <button
          type="button"
          className={`btn-link nav-link dropdown-toggle dropdown-toggle-no-caret border-0 rounded grw-btn-page-management ${isCompactMode ? 'py-0' : ''}`}
          data-toggle="dropdown"
        >
          <i className="icon-options"></i>
        </button>
      </>
    );
  };

  const ButtonForGuestUser: FC = () => {
    return (
      <>
        <button
          type="button"
          className={`btn nav-link bg-transparent dropdown-toggle dropdown-toggle-no-caret disabled ${isCompactMode ? 'py-0' : ''}`}
          id="icon-options-guest-tltips"
        >
          <i className="icon-options"></i>
        </button>
        <UncontrolledTooltip placement="top" target="icon-options-guest-tltips" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      </>
    );
  };

  return (
    <>
      { currentUser == null && <ButtonForGuestUser /> }
      { currentUser != null && <ButtonForCurrentUser /> }
    </>
  );

};


type DropdownMenuProps = {
  path: string,
  onClickDuplicate: () => void,
  onClickRename: () => void,
  onClickPresentation: () => void,
  onClickExport: (string) => void,
  onClickDelete: () => void,
  onClickEditTemplate: () => void,
}

export const PageManagementDropdownMenu:FC<DropdownMenuProps> = (props:DropdownMenuProps) => {

  const { t } = useTranslation();

  const isTopPagePath = isTopPage(props.path);
  const isDeletable = isDeletablePage(props.path);

  function renderDropdownItemForTopPage() {
    return (
      <>
        <button className="dropdown-item" type="button" onClick={props.onClickDuplicate}>
          <i className="icon-fw icon-docs"></i> { t('Duplicate') }
        </button>
        {/* TODO Presentation Mode is not function. So if it is really necessary, survey this cause and implement Presentation Mode in top page */}
        {/* <button className="dropdown-item" type="button" onClick={openPagePresentationModalHandler}>
          <i className="icon-fw"><PresentationIcon /></i><span className="d-none d-sm-inline"> { t('Presentation Mode') }</span>
        </button> */}
        <button type="button" className="dropdown-item" onClick={() => props.onClickExport('md')}>
          <i className="icon-fw icon-cloud-download"></i>{t('export_bulk.export_page_markdown')}
        </button>
        <div className="dropdown-divider"></div>
      </>
    );
  }

  function renderDropdownItemForNotTopPage() {
    return (
      <>
        <button className="dropdown-item" type="button" onClick={props.onClickRename}>
          <i className="icon-fw icon-action-redo"></i> { t('Move/Rename') }
        </button>
        <button className="dropdown-item" type="button" onClick={props.onClickDuplicate}>
          <i className="icon-fw icon-docs"></i> { t('Duplicate') }
        </button>
        <button className="dropdown-item" type="button" onClick={props.onClickPresentation}>
          <i className="icon-fw"><PresentationIcon /></i> { t('Presentation Mode') }
        </button>
        <button className="dropdown-item" type="button" onClick={() => props.onClickExport('md')}>
          <i className="icon-fw icon-cloud-download"></i>{t('export_bulk.export_page_markdown')}
        </button>
        {/* TODO GW-2746 create api to bulk export pages */}
        {/* <button className="dropdown-item" type="button" onClick={openArchiveModalHandler}>
          <i className="icon-fw"></i>{t('Create Archive Page')}
        </button> */}
        <div className="dropdown-divider"></div>
      </>
    );
  }

  function renderDropdownItemForDeletablePage() {
    return (
      <>
        <div className="dropdown-divider"></div>
        <button className="dropdown-item text-danger" type="button" onClick={props.onClickDelete}>
          <i className="icon-fw icon-fire"></i> { t('Delete') }
        </button>
      </>
    );
  }

  return (
    <>
      <div className="dropdown-menu dropdown-menu-right">
        {isTopPagePath ? renderDropdownItemForTopPage() : renderDropdownItemForNotTopPage()}
        <button className="dropdown-item" type="button" onClick={props.onClickEditTemplate}>
          <i className="icon-fw icon-magic-wand"></i> { t('template.option_label.create/edit') }
        </button>
        {(!isTopPagePath && isDeletable) && renderDropdownItemForDeletablePage()}
      </div>
    </>
  );
};


export const PageManagement:FC<Props> = (props:Props) => {

  const { data: path } = useCurrentPagePath();
  const { data: isAbleToDeleteCompletely } = useIsAbleToDeleteCompletely();
  const { data: currentPage } = useCurrentPageSWR();

  const DynamicPageManagementDropdownMenu = dynamic(() => Promise.resolve(PageManagementDropdownMenu), { ssr: false });
  const PageRenameModal = dynamic(() => import('./PageRenameModal'), { ssr: false });
  const PageDuplicateModal = dynamic(() => import('./PageDuplicateModal'), { ssr: false });
  const CreateTemplateModal = dynamic(() => import('./CreateTemplateModal'), { ssr: false });
  const PageDeleteModal = dynamic(() => import('./PageDeleteModal'), { ssr: false });
  const PagePresentationModal = dynamic(() => import('./PagePresentationModal'), { ssr: false });


  const [isPageRenameModalShown, setIsPageRenameModalShown] = useState(false);
  const [isPageDuplicateModalShown, setIsPageDuplicateModalShown] = useState(false);
  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);
  const [isPageDeleteModalShown, setIsPageDeleteModalShown] = useState(false);
  const [isPagePresentationModalShown, setIsPagePresentationModalShown] = useState(false);

  const { isCompactMode } = props;
  const revisionId = currentPage?.revision?._id;

  if (currentPage == null || revisionId == null || path == null) {
    return <PageManagementButton isCompactMode={isCompactMode} />;
  }

  // TODO GW-2746 bulk export pages
  // async function getArchivePageData() {
  //   try {
  //     const res = await appContainer.apiv3Get('page/count-children-pages', { pageId });
  //     setTotalPages(res.data.dummy);
  //   }
  //   catch (err) {
  //     setErrorMessage(t('export_bulk.failed_to_count_pages'));
  //   }
  // }

  function exportPageHandler(format: string): void {
    const url = new URL(urljoin(window.location.origin, '_api/v3/page/export', currentPage?._id));
    url.searchParams.append('format', format);
    url.searchParams.append('revisionId', revisionId as string);
    window.location.href = url.href;
  }

  // TODO GW-2746 create api to bulk export pages
  // function openArchiveModalHandler() {
  //   setIsArchiveCreateModalShown(true);
  //   getArchivePageData();
  // }

  // TODO GW-2746 create api to bulk export pages
  // function closeArchiveCreateModalHandler() {
  //   setIsArchiveCreateModalShown(false);
  // }

  return (
    <>
      <PageManagementButton isCompactMode={isCompactMode} />

      <DynamicPageManagementDropdownMenu
        path={path}
        onClickRename={() => setIsPageRenameModalShown(true)}
        onClickDuplicate={() => setIsPageDuplicateModalShown(true)}
        onClickDelete={() => setIsPageDeleteModalShown(true)}
        onClickExport={exportPageHandler}
        onClickPresentation={() => setIsPagePresentationModalShown(true)}
        onClickEditTemplate={() => setIsPageTempleteModalShown(true)}
      />

      <PageRenameModal
        currentPage={currentPage}
        isOpen={isPageRenameModalShown}
        onClose={() => setIsPageRenameModalShown(false)}
        path={path}
      />
      <PageDuplicateModal
        currentPage={currentPage}
        isOpen={isPageDuplicateModalShown}
        onClose={() => setIsPageDuplicateModalShown(false)}
      />
      <CreateTemplateModal
        isOpen={isPageTemplateModalShown}
        onClose={() => setIsPageTempleteModalShown(false)}
        path={path}
      />
      <PageDeleteModal
        currentPage={currentPage}
        isOpen={isPageDeleteModalShown}
        onClose={() => setIsPageDeleteModalShown(false)}
        isAbleToDeleteCompletely={isAbleToDeleteCompletely}
      />
      <PagePresentationModal
        isOpen={isPagePresentationModalShown}
        onClose={() => setIsPagePresentationModalShown(false)}
        href="?presentation=1"
      />
    </>
  );
};
