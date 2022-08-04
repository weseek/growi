import React, { ReactNode } from 'react';

import Head from 'next/head';

import { useGrowiTheme } from '~/stores/context';
import { useNextThemes } from '~/stores/use-next-themes';

import { RawLayout } from './RawLayout';

import styles from './Installer.module.scss';

type Props = {
  title: string,
  className?: string,
  children?: ReactNode,
}

export const NoLoginLayout = ({
  children, title, className,
}: Props): JSX.Element => {
  const classNames: string[] = ['wrapper'];
  if (className != null) {
    classNames.push(className);
  }
  return (
    <RawLayout title={title} className={`${styles.nologin}`}>
      <div className="nologin">
        <div id="wrapper">
          <div id="page-wrapper">
            <div className="main container-fluid">

              <div className="row">

                <div className="col-md-12">
                  <div className="login-header mx-auto">
                    <div className="logo"></div>
                    <h1 className="my-3">GROWI</h1>
                    <div className="login-form-errors px-3"></div>
                  </div>
                </div>

                <div className="col-md-12">
                  <div id="installer-form-container">
                    {children}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </RawLayout>
  );
};
