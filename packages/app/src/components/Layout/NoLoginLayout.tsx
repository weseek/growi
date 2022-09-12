import React, { ReactNode } from 'react';

import { isServer } from '@growi/core';
import { useTranslation } from 'next-i18next';

import GrowiLogo from '../Icons/GrowiLogo';

import { RawLayout } from './RawLayout';

import commonStyles from './NoLoginLayout.module.scss';

type Props = {
  title: string,
  className?: string,
  children?: ReactNode,
}

export const NoLoginLayout = ({ children, title, className }: Props): JSX.Element => {

  const { t } = useTranslation();

  if (isServer()) {
    return <></>;
  }
  const classNames: string[] = ['wrapper'];
  if (className != null) {
    classNames.push(className);
  }

  // errors?='aaa,bbb' => ['aaa', 'bbb']
  const { search } = window.location;
  const params = new URLSearchParams(search);
  const errorString = params.get('errors');
  const errors = errorString?.split(',');

  return (
    <RawLayout title={title} className={`${commonStyles.nologin}`}>
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
                    { errors != null && errors.length > 0 && (
                      <div className="register-form-errors px-3">
                        <div className="alert alert-danger">
                          {errors.map((err) => {
                            const i18nKey = `message.${err}`;
                            return <>{t(i18nKey)}<br/></>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {children}

              </div>
            </div>
          </div>
        </div>
      </div>
    </RawLayout>
  );
};
