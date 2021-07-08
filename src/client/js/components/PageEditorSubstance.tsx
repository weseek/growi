import React, { VFC, useState } from 'react'
import PageEditorWrapperNext from './PageEditor'
import { useCurrentPageSWR } from '~/stores/page';
import { useIsMobile } from '~/stores/ui';
import { useEditorConfig } from '~/stores/context';

const PageEditorSubstance: VFC =()=> {

  const { data: currentPage } = useCurrentPageSWR();
  const { data: isMobile } = useIsMobile();
  const { data: config } = useEditorConfig();

  console.log(isMobile)

  const [markdown, setMarkdown] = useState(currentPage?.revision?.body);
  const [isUploadable, setIsUploadable] = useState(config.upload.image || config.upload.file);
  const [isUploadableFile, setIsUploadableFile] = useState(config.upload.file);
  // const [isMathJaxEnabled, setIsMathJaxEnabled] = useState(!!config.env.MATHJAX);

  return (
    <PageEditorWrapperNext
      isUploadable={isUploadable}
      isUploadableFile={isUploadableFile}
      // isMathJaxEnabled={isMathJaxEnabled}
      markdown={markdown}
    />
  )


}

export default PageEditorSubstance
