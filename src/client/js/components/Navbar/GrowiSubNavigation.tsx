import dynamic from 'next/dynamic';
import React, { FC } from 'react';

import DevidedPagePath from '~/models/devided-page-path';
import LinkedPagePath from '~/models/linked-page-path';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import { useCurrentUser } from '~/stores/context';
import { useCurrentPageSWR } from '~/stores/page';
import {
  EditorMode,
  useIsAbleToShowTagLabel, useIsAbleToShowPageAuthors, useIsAbleToShowPageEditorModeManager, useEditorMode, useDrawerMode,
} from '~/stores/ui';

import CopyDropdown from '../Page/CopyDropdown';
import AuthorInfo from './AuthorInfo';
import DrawerToggler from './DrawerToggler';

const PagePathNav = ({
  // eslint-disable-next-line react/prop-types
  pageId, pagePath, isEditorMode, isCompactMode,
}) => {

  const dPagePath = new DevidedPagePath(pagePath, false, true);

  let formerLink;
  let latterLink;

  // one line
  if (dPagePath.isRoot || dPagePath.isFormerRoot || isEditorMode) {
    const linkedPagePath = new LinkedPagePath(pagePath);
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />;
  }
  // two line
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />;
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} />;
  }

  const copyDropdownId = `copydropdown${isCompactMode ? '-subnav-compact' : ''}-${pageId}`;
  const copyDropdownToggleClassName = 'd-block text-muted bg-transparent btn-copy border-0 py-0';

  return (
    <div className="grw-page-path-nav">
      {formerLink}
      <span className="d-flex align-items-center">
        <h1 className="m-0">{latterLink}</h1>
        <div className="mx-2">
          <CopyDropdown
            pageId={pageId}
            pagePath={pagePath}
            dropdownToggleId={copyDropdownId}
            dropdownToggleClassName={copyDropdownToggleClassName}
          >
            <i className="ti-clipboard"></i>
          </CopyDropdown>
        </div>
      </span>
    </div>
  );
};

type Props = {
  isCompactMode?: boolean;
  children?: JSX.Element | JSX.Element[],
}

const GrowiSubNavigationContainer: FC<Props> = (props: Props) => {
  const { isCompactMode, children } = props;

  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>
      {children}
    </div>
  );
};

const GrowiSubNavigationContents: FC<Props> = (props: Props) => {

  const { data: currentUser } = useCurrentUser();
  const { data: page } = useCurrentPageSWR();
  const { data: isAbleToShowTagLabel } = useIsAbleToShowTagLabel();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();
  const { data: isAbleToShowPageEditorModeManager } = useIsAbleToShowPageEditorModeManager();
  const { data: isDrawerMode } = useDrawerMode();
  const { data: editorMode } = useEditorMode();

  if (page == null || editorMode == null) {
    return null;
  }

  // dynamic import to skip rendering at SSR
  const GrowiSubnavButtons = dynamic(() => import('~/components/Navbar/GrowiSubnavButtons'), { ssr: false });
  const PageEditorModeManager = dynamic(() => import('./PageEditorModeManager'), { ssr: false });
  const TagLabels = dynamic(() => import('~/client/js/components/Page/TagLabels'), { ssr: false });

  const { isCompactMode } = props;

  const {
    _id: pageId, path, creator, createdAt, updatedAt, revision,
  } = page;

  const isGuestUser = currentUser == null;
  const isEditorMode = editorMode !== EditorMode.View;

  return (
    <>

      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        { isDrawerMode && (
          <div className={`d-none d-md-flex align-items-center ${isEditorMode ? 'mr-2 pr-2' : 'border-right mr-4 pr-4'}`}>
            <DrawerToggler />
          </div>
        ) }

        <div className="grw-path-nav-container">
          { isAbleToShowTagLabel && !isCompactMode && (
            <div className="grw-taglabels-container">
              <TagLabels editorMode={editorMode} />
            </div>
          ) }
          <PagePathNav pageId={pageId} pagePath={path} isEditorMode={isEditorMode} isCompactMode={isCompactMode} />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">

        <div className="d-flex flex-column align-items-end">
          {!isEditorMode && (
            <div className="d-flex">
              <GrowiSubnavButtons isCompactMode={isCompactMode} />
            </div>
          )}
          {isAbleToShowPageEditorModeManager && (
            <div className="mt-2">
              <PageEditorModeManager
                isBtnDisabled={isGuestUser}
              />
            </div>
          )}
        </div>

        {/* Page Authors */}
        { (isAbleToShowPageAuthors && !isCompactMode) && (
          <ul className="authors text-nowrap border-left d-none d-lg-block d-edit-none py-2 pl-4 mb-0 ml-3">
            <li className="pb-1">
              <AuthorInfo user={creator} date={createdAt} locate="subnav" />
            </li>
            <li className="mt-1 pt-1 border-top">
              <AuthorInfo user={revision?.author} date={updatedAt} mode="update" locate="subnav" />
            </li>
          </ul>
        ) }
      </div>

    </>
  );

};

const GrowiSubNavigation: FC<Props> = (props: Props) => {
  // skip rendering at SSR
  const Contents = dynamic(() => Promise.resolve(GrowiSubNavigationContents), { ssr: false });

  return (
    <GrowiSubNavigationContainer isCompactMode={props.isCompactMode}>
      <Contents isCompactMode={props.isCompactMode} />
    </GrowiSubNavigationContainer>
  );
};

export default GrowiSubNavigation;
