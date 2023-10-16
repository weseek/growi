import React, { ReactNode } from 'react';

import { useAppTitle } from '~/stores/context';

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

  const { data: appTitle } = useAppTitle();

  const classNames: string[] = [''];
  if (className != null) {
    classNames.push(className);
  }

  return (
    <RawLayout className={`nologin ${commonStyles.nologin} ${classNames}`}>
      <div className="page-wrapper flex-row">
        <div className="main container-fluid">

          <div className="row">

            <div className="col-md-12 position-relative">
              <div className="nologin-header mx-auto">
                <GrowiLogo />
                <h1 className="my-3">{ appTitle ?? 'GROWI' }</h1>
                <div className="noLogin-form-errors px-3"></div>
              </div>
              {children}
            </div>

          </div>
        </div>
      </div>
    </RawLayout>
  );
};
