import React from 'react';

import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';
import { LoginForm } from '~/components/LoginForm';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import { IExternalAccountLoginError, isExternalAccountLoginError } from '~/interfaces/errors/external-account-login-error';
import type { RegistrationMode } from '~/interfaces/registration-mode';
import {
  CommonProps, getServerSideCommonProps, generateCustomTitle, getNextI18NextConfig,
} from '~/pages/utils/commons';
import {
  useCsrfToken,
  useCurrentPathname,
} from '~/stores/context';


type Props = CommonProps & {
  registrationMode: RegistrationMode,
  pageWithMetaStr: string,
  isMailerSetup: boolean,
  enabledStrategies: unknown,
  registrationWhiteList: string[],
  isLocalStrategySetup: boolean,
  isLdapStrategySetup: boolean,
  isLdapSetupFailed: boolean,
  isPasswordResetEnabled: boolean,
  isEmailAuthenticationEnabled: boolean,
  externalAccountLoginError?: IExternalAccountLoginError,
};

const LoginPage: NextPage<Props> = (props: Props) => {

  // commons
  useCsrfToken(props.csrfToken);
  const { t } = useTranslation();

  // page
  useCurrentPathname(props.currentPathname);

  const title = generateCustomTitle(props, 'GROWI');
  const classNames: string[] = ['login-page'];

  console.log({ props });

  const renderAlert = () => {
    return (
      <div className="alert alert-success">
        <h2>{ t('login.Registration successful') }</h2>
      </div>
    );

    //  {% if reason === 'registered'%}
    // <div className="alert alert-success">
    //   <h2>{ t('login.Registration successful') }</h2>
    // </div>
    // {/* {% elseif reason === 'password-reset-order' %} */}
    // <div className="alert alert-warning mb-3">
    //   <h2>{ t('forgot_password.incorrect_token_or_expired_url') }</h2>
    // </div>
    // <a href="/forgot-password" className="link-switch">
    //   <i className="icon-key"></i> { t('forgot_password.forgot_password') }
    // </a>
    //   {/* {% else %} */}
    //   <div className="alert alert-warning">
    //     <h2>{ t('login.Sign in error') }</h2>
    //   </div>
  };

  return (
    <NoLoginLayout className={classNames.join(' ')}>

      <div className="mb-4 login-form-errors text-center">
        <div className='noLogin-dialog mx-auto'>
          <div className="col-12">
            {renderAlert()}
          </div>

        </div>
      </div>

      {/* <p>{ reasonMessage }</p> */}

    </NoLoginLayout>
  );
};

/**
 * for Server Side Translations
 * @param context
 * @param props
 * @param namespacesRequired
 */
async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

function injectEnabledStrategies(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    configManager,
  } = crowi;

  const enabledStrategies = {
    google: configManager.getConfig('crowi', 'security:passport-google:isEnabled'),
    github: configManager.getConfig('crowi', 'security:passport-github:isEnabled'),
    facebook: false,
    twitter: configManager.getConfig('crowi', 'security:passport-twitter:isEnabled'),
    saml: configManager.getConfig('crowi', 'security:passport-saml:isEnabled'),
    oidc: configManager.getConfig('crowi', 'security:passport-oidc:isEnabled'),
  };

  props.enabledStrategies = enabledStrategies;
}

async function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    mailService,
    configManager,
    passportService,
  } = crowi;

  props.isPasswordResetEnabled = crowi.configManager.getConfig('crowi', 'security:passport-local:isPasswordResetEnabled');
  props.isMailerSetup = mailService.isMailerSetup;
  props.isLocalStrategySetup = passportService.isLocalStrategySetup;
  props.isLdapStrategySetup = passportService.isLdapStrategySetup;
  props.isLdapSetupFailed = configManager.getConfig('crowi', 'security:passport-ldap:isEnabled') && !props.isLdapStrategySetup;
  props.registrationWhiteList = configManager.getConfig('crowi', 'security:registrationWhiteList');
  props.isEmailAuthenticationEnabled = configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled');
  props.registrationMode = configManager.getConfig('crowi', 'security:registrationMode');
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  if (context.query.externalAccountLoginError != null) {
    const externalAccountLoginError = context.query.externalAccountLoginError;
    if (isExternalAccountLoginError(externalAccountLoginError)) {
      props.externalAccountLoginError = { ...externalAccountLoginError as IExternalAccountLoginError };
    }
  }

  injectServerConfigurations(context, props);
  injectEnabledStrategies(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default LoginPage;
