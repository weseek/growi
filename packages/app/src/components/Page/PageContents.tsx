import React from 'react';

import dynamic from 'next/dynamic';

import { useSWRxCurrentPage } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';


const logger = loggerFactory('growi:cli:PageContents');


const PageContentsUtilities = dynamic(() => import('./PageContentsUtilities').then(mod => mod.PageContentsUtilities), { ssr: false });

export const PageContents = (): JSX.Element => {

  const { data: currentPage } = useSWRxCurrentPage();
  const { data: rendererOptions } = useViewOptions();

  const markdown = currentPage?.revision.body;

  return (
    <>
      <PageContentsUtilities />
      <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
    </>
  );

};
