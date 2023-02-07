import React, { useEffect, useState, useCallback } from 'react';

import { Ref, IRevision, IRevisionHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { Waypoint } from 'react-waypoint';

import { RendererOptions } from '~/services/renderer/renderer';
import { useSWRMUTxPageRevision } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';

export const ROOT_ELEM_ID = 'revision-loader' as const;

export type RevisionLoaderProps = {
  rendererOptions: RendererOptions,
  pageId: string,
  revisionId: Ref<IRevision>,
  lazy?: boolean,
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
    rendererOptions, pageId, revisionId, lazy, onRevisionLoaded,
  } = props;

  const {
    data: pageRevisionData, trigger: mutatePageRevision, isMutating, error,
  } = useSWRMUTxPageRevision(pageId, revisionId);

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
    if (!lazy) {
      loadData();
    }
  }, [lazy, loadData]);

  const onWaypointChange = (event) => {
    if (event.currentPosition === Waypoint.above || event.currentPosition === Waypoint.inside) {
      loadData();
    }
    return;
  };

  /* ----- before load ----- */
  const isLoaded = pageRevisionData != null && !isMutating && error == null;
  if (lazy && !isLoaded) {
    return (
      <Waypoint onPositionChange={onWaypointChange} bottomOffset="-100px" />
    );
  }

  /* ----- loading ----- */
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
