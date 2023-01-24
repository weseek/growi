import React, {
  useCallback, useEffect, useRef,
} from 'react';

import { pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { HtmlElementNode } from 'rehype-toc';

import { useDrawioModalLauncherForView } from '~/client/services/side-effects/drawio-modal-launcher-for-view';
import { useHandsontableModalLauncherForView } from '~/client/services/side-effects/handsontable-modal-launcher-for-view';
import { toastSuccess, toastError } from '~/client/util/toastr';
import {
  useIsGuestUser, useCurrentPathname,
} from '~/stores/context';
import { useEditingMarkdown } from '~/stores/editor';
import { useSWRxCurrentPage } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import {
  useCurrentPageTocNode,
  useIsMobile,
} from '~/stores/ui';
import { registerGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';

import styles from './Page.module.scss';

const logger = loggerFactory('growi:Page');


export const PageContents = (): JSX.Element => {
  const { t } = useTranslation();

  // Pass tocRef to generateViewOptions (=> rehypePlugin => customizeTOC) to call mutateCurrentPageTocNode when tocRef.current changes.
  // The toc node passed by customizeTOC is assigned to tocRef.current.
  const tocRef = useRef<HtmlElementNode>();

  const storeTocNodeHandler = useCallback((toc: HtmlElementNode) => {
    tocRef.current = toc;
  }, []);

  const { data: currentPathname } = useCurrentPathname();
  const isSharedPage = pagePathUtils.isSharedPage(currentPathname ?? '');

  const { data: currentPage, mutate: mutateCurrentPage } = useSWRxCurrentPage();
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


  if (currentPage == null || rendererOptions == null) {
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
    </div>
  );

};
