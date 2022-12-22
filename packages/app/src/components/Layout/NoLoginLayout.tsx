import React, { ReactNode } from 'react';

import GrowiLogo from '../Icons/GrowiLogo';

import { RawLayout } from './RawLayout';

import commonStyles from './NoLoginLayout.module.scss';

type Props = {
  className?: string,
  children?: ReactNode,
}

export const NoLoginLayout = ({
  children, className,
}: Props): JSX.Element => {
  const classNames: string[] = ['wrapper'];
  if (className != null) {
    classNames.push(className);
  }
  return (
    <RawLayout className={`${commonStyles.nologin}`}>
      <div className="nologin error">
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
