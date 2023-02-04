import React, { useEffect, useState, useCallback } from 'react';

import { IRevisionHasId } from '@growi/core';
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
  revisionId: string,
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

  const { trigger: mutatePageRevision } = useSWRMUTxPageRevision(pageId, revisionId);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [markdown, setMarkdown] = useState<string>('');
  const [errors, setErrors] = useState<any | null>(null);

  const loadData = useCallback(async() => {
    if (!isLoaded && !isLoading) {
      setIsLoading(true);
    }

    // load data with REST API
    try {
      const pageRevision = await mutatePageRevision();

      setMarkdown(pageRevision?.body ?? '');

      if (onRevisionLoaded != null && pageRevision != null) {
        onRevisionLoaded(pageRevision);
      }
    }
    catch (errors) {
      setErrors(errors);
    }
    finally {
      setIsLoaded(true);
      setIsLoading(false);
    }

  }, [isLoaded, isLoading, mutatePageRevision, onRevisionLoaded]);

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

  useEffect(() => {
    if (errors == null) return;

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
  }, [errors, t]);

  /* ----- before load ----- */
  if (lazy && !isLoaded) {
    return (
      <Waypoint onPositionChange={onWaypointChange} bottomOffset="-100px" />
    );
  }

  /* ----- loading ----- */
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
