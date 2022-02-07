import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import { DropdownItem } from 'reactstrap';

import { withUnstatedContainers } from '../UnstatedUtils';
import EditorContainer from '~/client/services/EditorContainer';
import {
  EditorMode, useDrawerMode, useEditorMode, useIsDeviceSmallerThanMd, useIsAbleToShowPageManagement, useIsAbleToShowTagLabel,
  useIsAbleToShowPageEditorModeManager, useIsAbleToShowPageAuthors, usePageDuplicateModalStatus, usePageRenameModalStatus, usePageDeleteModalStatus,
} from '~/stores/ui';
import {
  useCurrentCreatedAt, useCurrentUpdatedAt, useCurrentPageId, useRevisionId, useCurrentPagePath,
  useCreator, useRevisionAuthor, useCurrentUser, useIsGuestUser, useIsSharedUser,
} from '~/stores/context';
import { useSWRTagsInfo } from '~/stores/page';

import { AdditionalMenuItemsRendererProps } from '../Common/Dropdown/PageItemControl';
import { SubNavButtons } from './SubNavButtons';
import PageEditorModeManager from './PageEditorModeManager';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import { IPageHasId } from '~/interfaces/page';
import { GrowiSubNavigation } from './GrowiSubNavigation';
import PagePresentationModal from '../PagePresentationModal';
import PresentationIcon from '../Icons/PresentationIcon';
import CreateTemplateModal from '../CreateTemplateModal';
import { exportAsMarkdown } from '~/client/services/page-operation';


type AdditionalMenuItemsProps = AdditionalMenuItemsRendererProps & {
  pageId: string,
  revisionId: string,
  onClickPresentationMenuItem: (isPagePresentationModalShown: boolean) => void,
  onClickTemplateMenuItem: (isPageTemplateModalShown: boolean) => void,

}

const AdditionalMenuItems = (props: AdditionalMenuItemsProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    pageId, revisionId, onClickPresentationMenuItem, onClickTemplateMenuItem,
  } = props;

  const openPagePresentationModalHandler = () => {
    onClickPresentationMenuItem(true);
  };

  const openPageTemplateModalHandler = () => {
    onClickTemplateMenuItem(true);
  };


  return (
    <>
      <DropdownItem divider />

      {/* Presentation */}
      <DropdownItem onClick={openPagePresentationModalHandler}>
        <i className="icon-fw"><PresentationIcon /></i>
        { t('Presentation Mode') }
      </DropdownItem>

      {/* Export markdown */}
      <DropdownItem onClick={() => exportAsMarkdown(pageId, revisionId, 'md')}>
        <i className="icon-fw icon-cloud-download"></i>
        {t('export_bulk.export_page_markdown')}
      </DropdownItem>

      <DropdownItem divider />

      {/* Create template */}
      <DropdownItem onClick={openPageTemplateModalHandler}>
        <i className="icon-fw icon-magic-wand"></i> { t('template.option_label.create/edit') }
      </DropdownItem>
    </>
  );
};


const GrowiContextualSubNavigation = (props) => {
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { data: isDrawerMode } = useDrawerMode();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: createdAt } = useCurrentCreatedAt();
  const { data: updatedAt } = useCurrentUpdatedAt();
  const { data: pageId } = useCurrentPageId();
  const { data: revisionId } = useRevisionId();
  const { data: path } = useCurrentPagePath();
  const { data: creator } = useCreator();
  const { data: revisionAuthor } = useRevisionAuthor();
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();

  const { data: isAbleToShowPageManagement } = useIsAbleToShowPageManagement();
  const { data: isAbleToShowTagLabel } = useIsAbleToShowTagLabel();
  const { data: isAbleToShowPageEditorModeManager } = useIsAbleToShowPageEditorModeManager();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();

  const { mutate: mutateSWRTagsInfo, data: tagsInfoData } = useSWRTagsInfo(pageId);

  const { open: openDuplicateModal } = usePageDuplicateModalStatus();
  const { open: openRenameModal } = usePageRenameModalStatus();
  const { open: openDeleteModal } = usePageDeleteModalStatus();

  const [isPagePresentationModalShown, setIsPagePresentationModalShown] = useState(false);
  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);

  const {
    editorContainer, isCompactMode,
  } = props;

  const isViewMode = editorMode === EditorMode.View;

  const tagsUpdatedHandler = useCallback(async(newTags: string[]) => {
    // It will not be reflected in the DB until the page is refreshed
    if (editorMode === EditorMode.Editor) {
      return editorContainer.setState({ tags: newTags });
    }

    try {
      const { tags } = await apiPost('/tags.update', { pageId, revisionId, tags: newTags }) as { tags };

      // revalidate SWRTagsInfo
      mutateSWRTagsInfo();
      // update editorContainer.state
      editorContainer.setState({ tags });

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const duplicateItemClickedHandler = useCallback(async(pageId, path) => {
    openDuplicateModal(pageId, path);
  }, [openDuplicateModal]);

  const reameItemClickedHandler = useCallback(async(pageId, revisionId, path) => {
    openRenameModal(pageId, revisionId, path);
  }, [openRenameModal]);

  const deleteItemClickedHandler = useCallback(async(pageToDelete) => {
    openDeleteModal([pageToDelete]);
  }, [openDeleteModal]);

  const presentationMenuItemClickHandler = useCallback(() => {
    setIsPagePresentationModalShown(true);
  }, []);

  const templateMenuItemClickHandler = useCallback(() => {
    setIsPageTempleteModalShown(true);
  }, []);

  const renderAdditionalModals = useCallback(() => {
    if (currentUser == null) {
      return <></>;
    }
    return (
      <>
        <PagePresentationModal
          isOpen={isPagePresentationModalShown}
          onClose={() => setIsPagePresentationModalShown(false)}
          href="?presentation=1"
        />
        {path
        && (
          <CreateTemplateModal
            path={path}
            isOpen={isPageTemplateModalShown}
            onClose={() => setIsPageTempleteModalShown(false)}
          />
        )
        }
      </>
    );
  }, [currentUser, isPagePresentationModalShown, isPageTemplateModalShown, path]);

  const ControlComponents = useCallback(() => {
    function onPageEditorModeButtonClicked(viewType) {
      mutateEditorMode(viewType);
    }

    return (
      <>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
          { pageId != null && isViewMode && (
            <SubNavButtons
              isCompactMode={isCompactMode}
              pageId={pageId}
              revisionId={revisionId}
              path={path}
              disableSeenUserInfoPopover={isSharedUser}
              showPageControlDropdown={isAbleToShowPageManagement}
              additionalMenuItemRenderer={props => (
                <AdditionalMenuItems
                  {...props}
                  pageId={pageId}
                  revisionId={revisionId}
                  onClickPresentationMenuItem={presentationMenuItemClickHandler}
                  onClickTemplateMenuItem={templateMenuItemClickHandler}
                />
              )}
              onClickDuplicateMenuItem={duplicateItemClickedHandler}
              onClickRenameMenuItem={reameItemClickedHandler}
              onClickDeleteMenuItem={deleteItemClickedHandler}
            />
          ) }
        </div>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
          {isAbleToShowPageEditorModeManager && (
            <PageEditorModeManager
              onPageEditorModeButtonClicked={onPageEditorModeButtonClicked}
              isBtnDisabled={isGuestUser}
              editorMode={editorMode}
              isDeviceSmallerThanMd={isDeviceSmallerThanMd}
            />
          )}
        </div>
        {renderAdditionalModals()}
      </>
    );
  }, [pageId, isViewMode, isCompactMode, revisionId, path, isSharedUser,
      isAbleToShowPageManagement, duplicateItemClickedHandler, reameItemClickedHandler,
      deleteItemClickedHandler, isAbleToShowPageEditorModeManager, isGuestUser, editorMode, isDeviceSmallerThanMd,
      renderAdditionalModals, mutateEditorMode, presentationMenuItemClickHandler,
  ]);


  if (path == null) {
    return <></>;
  }

  const currentPage: Partial<IPageHasId> = {
    _id: pageId ?? undefined,
    path,
    revision: revisionId ?? undefined,
    creator: creator ?? undefined,
    lastUpdateUser: revisionAuthor,
    createdAt: createdAt ?? undefined,
    updatedAt: updatedAt ?? undefined,
  };


  return (
    <GrowiSubNavigation
      page={currentPage}
      showDrawerToggler={isDrawerMode}
      showTagLabel={isAbleToShowTagLabel}
      showPageAuthors={isAbleToShowPageAuthors}
      tags={tagsInfoData?.tags || []}
      tagsUpdatedHandler={tagsUpdatedHandler}
      controls={ControlComponents}
    />
  );
};

/**
 * Wrapper component for using unstated
 */
const GrowiContextualSubNavigationWrapper = withUnstatedContainers(GrowiContextualSubNavigation, [EditorContainer]);


GrowiContextualSubNavigation.propTypes = {
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  isCompactMode: PropTypes.bool,
};

export default GrowiContextualSubNavigationWrapper;
