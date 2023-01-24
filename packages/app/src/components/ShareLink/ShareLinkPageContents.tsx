import React, { useEffect } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import type { HtmlElementNode } from 'rehype-toc';

import { useViewOptions } from '~/stores/renderer';
import { useCurrentPageTocNode } from '~/stores/ui';
import { registerGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from '../Page/RevisionRenderer';


const logger = loggerFactory('growi:Page');


type Props = {
  page?: IPagePopulatedToShowRevision,
}

export const ShareLinkPageContents = (props: Props): JSX.Element => {
  const { page } = props;

  const { mutate: mutateCurrentPageTocNode } = useCurrentPageTocNode();

  const { data: rendererOptions, mutate: mutateRendererOptions } = useViewOptions((toc: HtmlElementNode) => {
    mutateCurrentPageTocNode(toc);
  });

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
