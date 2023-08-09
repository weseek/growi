import React from 'react';

import RevisionRenderer from '~/components/Page/RevisionRenderer';
import type { RendererOptions } from '~/interfaces/renderer-options';
import loggerFactory from '~/utils/logger';

import styles from './CustomSidebarSubstance.module.scss';


const logger = loggerFactory('growi:components:CustomSidebarSubstance');


type Props = {
  markdown: string,
  rendererOptions: RendererOptions
}

export const CustomSidebarSubstance = (props: Props): JSX.Element => {
  const { markdown, rendererOptions } = props;

  return (
    <div className={`py-3 grw-custom-sidebar-content ${styles['grw-custom-sidebar-content']}`}>
      <RevisionRenderer
        rendererOptions={rendererOptions}
        markdown={markdown}
      />
    </div>
  );
};
