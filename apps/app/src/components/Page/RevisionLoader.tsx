import React, { useState, useEffect } from 'react';

import type { Ref, IRevision, IRevisionHasId } from '@growi/core/dist/interfaces';
import { useTranslation } from 'next-i18next';

import type { RendererOptions } from '~/interfaces/renderer-options';
import { useSWRxPageRevision } from '~/stores/page';
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

  const { data: pageRevision, isLoading, error } = useSWRxPageRevision(pageId, revisionId);

  const [markdown, setMarkdown] = useState<string>('');

  useEffect(() => {
    if (pageRevision != null) {
      setMarkdown(pageRevision?.body ?? '');

      if (onRevisionLoaded != null) {
        onRevisionLoaded(pageRevision);
      }
    }

  }, [onRevisionLoaded, pageRevision]);

  useEffect(() => {
    if (error != null) {
      const isForbidden = error != null && error[0].code === 'forbidden-page';
      if (isForbidden) {
        setMarkdown(`<i class="icon-exclamation p-1"></i>${t('not_allowed_to_see_this_page')}`);
      }
      else {
        const errorMessages = error.map((error) => {
          return `<i class="icon-exclamation p-1"></i><span class="text-muted"><em>${error.message}</em></span>`;
        });
        setMarkdown(errorMessages.join('\n'));
      }
    }
  }, [error, t]);

  if (isLoading) {
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
