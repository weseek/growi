import React, {
  useCallback, useEffect, useRef,
} from 'react';

import EventEmitter from 'events';

import { pagePathUtils, IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { HtmlElementNode } from 'rehype-toc';

import { useDrawioModalLauncherForView } from '~/client/services/side-effects/drawio-modal-launcher-for-view';
import { useHandsontableModalLauncherForView } from '~/client/services/side-effects/handsontable-modal-launcher-for-view';
import { toastSuccess, toastError } from '~/client/util/toastr';
import {
  useIsGuestUser, useCurrentPathname, useIsNotFound,
} from '~/stores/context';
import { useEditingMarkdown } from '~/stores/editor';
import { useCurrentPagePath, useSWRxCurrentPage } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import {
  useCurrentPageTocNode,
  useIsMobile,
} from '~/stores/ui';
import { registerGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './Page/RevisionRenderer';
import { UserInfo } from './User/UserInfo';

import styles from './Page.module.scss';


const { isUsersHomePage } = pagePathUtils;


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

const NotFoundPage = dynamic(() => import('./NotFoundPage'), { ssr: false });
const GridEditModal = dynamic(() => import('./PageEditor/GridEditModal'), { ssr: false });
const LinkEditModal = dynamic(() => import('./PageEditor/LinkEditModal'), { ssr: false });


const logger = loggerFactory('growi:Page');

type PageSubstanceProps = {
  currentPage?: IPagePopulatedToShowRevision,
}

const PageSubstance = (props: PageSubstanceProps): JSX.Element => {
  const { t } = useTranslation();
  const { currentPage } = props;

  // Pass tocRef to generateViewOptions (=> rehypePlugin => customizeTOC) to call mutateCurrentPageTocNode when tocRef.current changes.
  // The toc node passed by customizeTOC is assigned to tocRef.current.
  const tocRef = useRef<HtmlElementNode>();

  const storeTocNodeHandler = useCallback((toc: HtmlElementNode) => {
    tocRef.current = toc;
  }, []);

  const { data: currentPathname } = useCurrentPathname();
  const isSharedPage = pagePathUtils.isSharedPage(currentPathname ?? '');

  const { mutate: mutateCurrentPage } = useSWRxCurrentPage();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isMobile } = useIsMobile();
  const { data: rendererOptions, mutate: mutateRendererOptions } = useViewOptions(storeTocNodeHandler);
  const { mutate: mutateCurrentPageTocNode } = useCurrentPageTocNode();


  // register to facade
  useEffect(() => {
    registerGrowiFacade({
      markdownRenderer: {
        optionsMutators: {
          viewOptionsMutator: mutateRendererOptions,
        },
      },
    });
  }, [mutateRendererOptions]);

  useEffect(() => {
    mutateCurrentPageTocNode(tocRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutateCurrentPageTocNode, tocRef.current]); // include tocRef.current to call mutateCurrentPageTocNode when tocRef.current changes


  useHandsontableModalLauncherForView({
    onSaveSuccess: (newMarkdown) => {
      toastSuccess(t('toaster.save_succeeded'));

      // rerender
      if (!isSharedPage) {
        mutateCurrentPage();
      }
      mutateEditingMarkdown(newMarkdown);
    },
    onSaveError: (error) => {
      toastError(error);
    },
  });

  useDrawioModalLauncherForView({
    onSaveSuccess: (newMarkdown) => {
      toastSuccess(t('toaster.save_succeeded'));

      // rerender
      if (!isSharedPage) {
        mutateCurrentPage();
      }
      mutateEditingMarkdown(newMarkdown);
    },
    onSaveError: (error) => {
      toastError(error);
    },
  });


  if (currentPage == null || isGuestUser == null || rendererOptions == null) {
    const entries = Object.entries({
      currentPage, isGuestUser, rendererOptions,
    })
      .map(([key, value]) => [key, value == null ? 'null' : undefined])
      .filter(([, value]) => value != null);

    logger.warn('Some of materials are missing.', Object.fromEntries(entries));

    return <></>;
  }

  const { _id: revisionId, body: markdown } = currentPage.revision;

  return (
    <div className={`mb-5 ${isMobile ? `page-mobile ${styles['page-mobile']}` : ''}`}>

      { revisionId != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
      )}

      { !isGuestUser && (
        <>
          <GridEditModal />
          <LinkEditModal />
        </>
      )}
    </div>
  );

};


export const Page = React.memo((): JSX.Element => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isNotFound } = useIsNotFound();
  const { data: currentPage } = useSWRxCurrentPage();

  const isUsersHomePagePath = isUsersHomePage(currentPagePath ?? '');

  return (
    <>
      { isUsersHomePagePath && <UserInfo author={currentPage?.creator} /> }

      { !isNotFound && (
        <PageSubstance currentPage={currentPage ?? undefined} />
      ) }

      { isNotFound && <NotFoundPage /> }
    </>
  );
});
Page.displayName = 'Page';
