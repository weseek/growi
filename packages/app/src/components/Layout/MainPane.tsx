import { ReactNode } from 'react';


type Props = {
  className?: string,
  children?: ReactNode,
  sideContents?: ReactNode,
  footerContents?: ReactNode,
}

export const MainPane = (props: Props): JSX.Element => {
  const {
    className, children, sideContents, footerContents,
  } = props;

  return (
    <>
      <div className="flex-grow-1">
        <div id="main" className={`main ${className}`}>
          <div id="content-main" className="content-main grw-container-convertible">
            { sideContents != null
              ? (
                <div className="d-flex flex-column flex-lg-row">
                  <div className="flex-grow-1 flex-basis-0 mw-0">
                    {children}
                  </div>
                  <div className="grw-side-contents-container d-edit-none" data-vrt-blackout-side-contents>
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
      </div>

      { footerContents != null && (
        <footer className="footer d-edit-none">
          {footerContents}
        </footer>
      ) }
    </>
  );
};
