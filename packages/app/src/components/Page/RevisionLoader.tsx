import React, { useState, useCallback, useEffect } from 'react';

import { Ref, IRevision, IRevisionHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { RendererOptions } from '~/services/renderer/renderer';
import { useSWRMUTxPageRevision } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';

export const ROOT_ELEM_ID = 'revision-loader' as const;

export type RevisionLoaderProps = {
  rendererOptions: RendererOptions,
  pageId: string,
  revisionId: Ref<IRevision>,
  onRevisionLoaded?: (revision: IRevisionHasId) => void,
}

const logger = loggerFactory('growi:Page:RevisionLoader');

// Always render '#revision-loader' for MutationObserver of SearchResultContent
const RevisionLoaderRoot = (props: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div id={ROOT_ELEM_ID} {...props}>{props.children}</div>
);

/**
 * Load data from server and render RevisionBody component
 */
export const RevisionLoader = (props: RevisionLoaderProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    rendererOptions, pageId, revisionId, onRevisionLoaded,
  } = props;

  const { trigger: mutatePageRevision, isMutating } = useSWRMUTxPageRevision(pageId, revisionId);

  const [markdown, setMarkdown] = useState<string>('');

  const loadData = useCallback(async() => {
    try {
      const pageRevision = await mutatePageRevision();

      setMarkdown(pageRevision?.body ?? '');

      if (onRevisionLoaded != null && pageRevision != null) {
        onRevisionLoaded(pageRevision);
      }
    }
    catch (errors) {
      const isForbidden = errors != null && errors[0].code === 'forbidden-page';
      if (isForbidden) {
        setMarkdown(`<i class="icon-exclamation p-1"></i>${t('not_allowed_to_see_this_page')}`);
      }
      else {
        const errorMessages = errors.map((error) => {
          return `<i class="icon-exclamation p-1"></i><span class="text-muted"><em>${error.message}</em></span>`;
        });
        setMarkdown(errorMessages.join('\n'));
      }
    }

  }, [mutatePageRevision, onRevisionLoaded, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isMutating) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  return (
    <RevisionLoaderRoot>
      <RevisionRenderer
        rendererOptions={rendererOptions}
        markdown={markdown}
      />
    </RevisionLoaderRoot>
  );
};
