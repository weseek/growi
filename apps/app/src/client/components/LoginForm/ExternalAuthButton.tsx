import { useCallback } from 'react';

import { IExternalAuthProviderType } from '@growi/core';
import { useTranslation } from 'next-i18next';

const authIcon = {
  [IExternalAuthProviderType.google]: <span className="growi-custom-icons align-bottom">google</span>,
  [IExternalAuthProviderType.github]: <span className="growi-custom-icons align-bottom">github</span>,
  [IExternalAuthProviderType.facebook]: <span className="growi-custom-icons align-bottom">facebook</span>,
  [IExternalAuthProviderType.oidc]: <span className="growi-custom-icons align-bottom">openid</span>,
  [IExternalAuthProviderType.saml]: <span className="material-symbols-outlined align-bottom">key</span>,
};

const authLabel = {
  [IExternalAuthProviderType.google]: 'Google',
  [IExternalAuthProviderType.github]: 'GitHub',
  [IExternalAuthProviderType.facebook]: 'Facebook',
  [IExternalAuthProviderType.oidc]: 'OIDC',
  [IExternalAuthProviderType.saml]: 'SAML',
};


export const ExternalAuthButton = ({ authType }: {authType: IExternalAuthProviderType}): React.ReactElement => {
  const { t } = useTranslation();

  const key = `btn-auth-${authType.toString()}`;
  const btnClass = `btn-auth-${authType.toString()}`;

  const handleLoginWithExternalAuth = useCallback(() => {
    window.location.href = `/passport/${authType.toString()}`;
  }, [authType]);

  return (
    <button
      key={key}
      type="button"
      className={`btn btn-secondary ${btnClass} my-2 col-10 col-sm-7 mx-auto d-flex`}
      onClick={handleLoginWithExternalAuth}
    >
      <span>{authIcon[authType]}</span>
      <span className="flex-grow-1">{t('Sign in with External auth', { signin: authLabel[authType] })}</span>
    </button>
  );
};
