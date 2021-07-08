import React, { VFC, useRef } from 'react'
import PageEditorWrapperNext from './PageEditor'
import { useCurrentPageSWR } from '~/stores/page';
import { useIsMobile } from '~/stores/ui';
import { useEditorConfig } from '~/stores/context';

const PageEditorSubstance: VFC =()=> {
  const editor = useRef();
  const previewElement = useRef();

  const { data: currentPage } = useCurrentPageSWR();
  const { data: isMobile } = useIsMobile();
  const { data: config } = useEditorConfig();

  return <PageEditorWrapperNext />

}

export default PageEditorSubstance
