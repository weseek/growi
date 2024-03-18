import type { IPagePopulatedToShowRevision } from '@growi/core';


import { PagePathNavSticky } from './Common/PagePathNav';

import styles from './common/PageViewLayout.module.scss';

type Props = {
  pagePath: string,
  page?: IPagePopulatedToShowRevision,
  expandContentWidth?: boolean,
}

export const TrashPageViewLayout = (props: Props): JSX.Element => {
  const {
    pagePath, expandContentWidth,
  } = props;

  const pageViewLayoutClass = styles['page-view-layout'] ?? '';
  const _fluidLayoutClass = styles['fluid-layout'] ?? '';
  const fluidLayoutClass = expandContentWidth ? _fluidLayoutClass : '';

  return (
    <div id="main" className={`main ${pageViewLayoutClass} ${fluidLayoutClass} flex-expand-vert`}>
      <div id="content-main" className="content-main container-lg grw-container-convertible flex-expand-vert">
        <PagePathNavSticky pagePath={pagePath} />
      </div>
    </div>
  );
};
