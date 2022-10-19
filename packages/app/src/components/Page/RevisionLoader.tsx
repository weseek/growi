import React, { useEffect, useState, useCallback } from 'react';

import { Ref, IRevision, IRevisionHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { Waypoint } from 'react-waypoint';

import { apiv3Get } from '~/client/util/apiv3-client';
import { RendererOptions } from '~/services/renderer/renderer';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';

export type RevisionLoaderProps = {
  rendererOptions: RendererOptions,
  pageId: string,
  revisionId: Ref<IRevision>,
  lazy?: boolean,
  onRevisionLoaded?: (revision: IRevisionHasId) => void,

  pagePath: string,
  highlightKeywords?: string[],
}

const logger = loggerFactory('growi:Page:RevisionLoader');

/**
 * Load data from server and render RevisionBody component
 */
export const RevisionLoader = (props: RevisionLoaderProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    rendererOptions, pageId, revisionId, lazy, onRevisionLoaded,
  } = props;

  const [isLoading, setIsLoading] = useState<boolean>();
  const [isLoaded, setIsLoaded] = useState<boolean>();
  const [markdown, setMarkdown] = useState<string>('');
  const [errors, setErrors] = useState<any | null>();

  const loadData = useCallback(async() => {
    if (!isLoaded && !isLoading) {
      setIsLoading(true);
    }

    // load data with REST API
    try {
      const res = await apiv3Get(`/revisions/${revisionId}`, { pageId });

      setMarkdown(res.data?.revision?.body);
      setErrors(null);

      if (onRevisionLoaded != null) {
        onRevisionLoaded(res.data.revision);
      }
    }
    catch (errors) {
      setErrors(errors);
    }
    finally {
      setIsLoaded(true);
      setIsLoading(false);
    }

  }, [isLoaded, isLoading, onRevisionLoaded, pageId, revisionId]);

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
  if (lazy && !isLoaded) {
    return (
      <Waypoint onPositionChange={onWaypointChange} bottomOffset="-100px">
        <div className="wiki"></div>
      </Waypoint>
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

  /* ----- after load ----- */
  const isForbidden = errors != null && errors[0].code === 'forbidden-page';
  if (isForbidden) {
    setMarkdown(`<i class="icon-exclamation p-1"></i>${t('not_allowed_to_see_this_page')}`);
  }
  else if (errors != null) {
    const errorMessages = errors.map((error) => {
      return `<i class="icon-exclamation p-1"></i><span class="text-muted"><em>${error.message}</em></span>`;
    });
    setMarkdown(errorMessages.join('\n'));
  }

  return (
    <RevisionRenderer
      rendererOptions={rendererOptions}
      markdown={markdown}
    />
  );
};
