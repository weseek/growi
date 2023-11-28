import type { ReactNode } from 'react';

import styles from './PageViewLayout.module.scss';

const pageViewLayoutClass = styles['page-view-layout'] ?? '';
const footerLayoutClass = styles['footer-layout'] ?? '';
const _fluidLayoutClass = styles['fluid-layout'] ?? '';

type Props = {
  children?: ReactNode,
  headerContents?: ReactNode,
  sideContents?: ReactNode,
  footerContents?: ReactNode,
  isLayoutFluid?: boolean,
}

export const PageViewLayout = (props: Props): JSX.Element => {
  const {
    children, headerContents, sideContents, footerContents,
    isLayoutFluid,
  } = props;

  const fluidLayoutClass = isLayoutFluid ? _fluidLayoutClass : '';

  return (
    <>
      <div id="main" className={`main ${pageViewLayoutClass} ${fluidLayoutClass} flex-expand-vert`}>
        <div id="content-main" className="content-main container-lg grw-container-convertible flex-expand-vert">
          { headerContents != null && headerContents }
          { sideContents != null
            ? (
              <div className="flex-expand-horiz gap-3">
                <div className="flex-expand-vert flex-basis-0 mw-0">
                  {children}
                </div>
                <div className="grw-side-contents-container col-lg-3  d-edit-none d-print-none" data-vrt-blackout-side-contents>
                  <div className="grw-side-contents-sticky-container">
                    {sideContents}
                  </div>
                </div>
              </div>
            )
            : (
              <>{children}</>
            )
          }
        </div>
      </div>

      { footerContents != null && (
        <footer className={`footer d-edit-none ${footerLayoutClass} ${fluidLayoutClass}`}>
          {footerContents}
        </footer>
      ) }
    </>
  );
};
