import React, { ReactNode } from 'react';

import GrowiLogo from '../Icons/GrowiLogo';

import { RawLayout } from './RawLayout';

import commonStyles from './NoLoginLayout.module.scss';

type Props = {
  title: string,
  className?: string,
  children?: ReactNode,
  customCss?: string,
}

export const NoLoginLayout = ({
  children, title, className, customCss,
}: Props): JSX.Element => {
  const classNames: string[] = ['wrapper'];
  if (className != null) {
    classNames.push(className);
  }
  return (
    <RawLayout title={title} className={`${commonStyles.nologin}`} customCss={customCss}>
      <div className="nologin">
        <div id="wrapper">
          <div id="page-wrapper">
            <div className="main container-fluid">

              <div className="row">

                <div className="col-md-12">
                  <div className="noLogin-header mx-auto">
                    <GrowiLogo />
                    <h1 className="my-3">GROWI</h1>
                    <div className="noLogin-form-errors px-3"></div>
                  </div>
                  {children}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </RawLayout>
  );
};
