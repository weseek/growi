import React, { useEffect } from 'react';

import { pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { useDrawioModalLauncherForView } from '~/client/services/side-effects/drawio-modal-launcher-for-view';
import { useHandsontableModalLauncherForView } from '~/client/services/side-effects/handsontable-modal-launcher-for-view';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useCurrentPathname } from '~/stores/context';
import { useEditingMarkdown } from '~/stores/editor';
import { useSWRxCurrentPage } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import { registerGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';


const logger = loggerFactory('growi:Page');


export const PageContents = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: currentPathname } = useCurrentPathname();
  const isSharedPage = pagePathUtils.isSharedPage(currentPathname ?? '');

  const { data: currentPage, mutate: mutateCurrentPage } = useSWRxCurrentPage();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();
  const updateStateAfterSave = useUpdateStateAfterSave(currentPage?._id);

  const { data: rendererOptions, mutate: mutateRendererOptions } = useViewOptions();

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

  useHandsontableModalLauncherForView({
    onSaveSuccess: () => {
      toastSuccess(t('toaster.save_succeeded'));

      updateStateAfterSave?.();
    },
    onSaveError: (error) => {
      toastError(error);
    },
  });

  useDrawioModalLauncherForView({
    onSaveSuccess: () => {
      toastSuccess(t('toaster.save_succeeded'));

      updateStateAfterSave?.();
    },
    onSaveError: (error) => {
      toastError(error);
    },
  });


  if (currentPage == null || rendererOptions == null) {
    const entries = Object.entries({
      currentPage, rendererOptions,
    })
      .map(([key, value]) => [key, value == null ? 'null' : undefined])
      .filter(([, value]) => value != null);

    logger.warn('Some of materials are missing.', Object.fromEntries(entries));

    return <></>;
  }

  const { _id: revisionId, body: markdown } = currentPage.revision;

  return (
    <>
      { revisionId != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
      )}
    </>
  );

};
