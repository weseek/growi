import React, { FC } from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';

export const CompleteUserRegistration: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="noLogin-dialog mx-auto" id="noLogin-dialog">
      <div className="row mx-0">
        <div className="col-12 mb-3 text-center">
          <p className="alert alert-success">
            <span>{t('login.Registration successful')}</span>
          </p>
          <Link href='/login' prefetch={false}>
            <a>
              <i className="icon-login mr-1" />{t('Sign in is here')}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};
