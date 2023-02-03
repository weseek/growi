import React, { useEffect } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';

import { useViewOptions } from '~/stores/renderer';
import { registerGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from '../Page/RevisionRenderer';


const logger = loggerFactory('growi:Page');


export type ShareLinkPageContentsProps = {
  page?: IPagePopulatedToShowRevision,
}

export const ShareLinkPageContents = (props: ShareLinkPageContentsProps): JSX.Element => {
  const { page } = props;

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


  if (page == null || rendererOptions == null) {
    const entries = Object.entries({
      page, rendererOptions,
    })
      .map(([key, value]) => [key, value == null ? 'null' : undefined])
      .filter(([, value]) => value != null);

    logger.warn('Some of materials are missing.', Object.fromEntries(entries));

    return <></>;
  }

  const { _id: revisionId, body: markdown } = page.revision;

  return (
    <>
      { revisionId != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
      )}
    </>
  );

};
