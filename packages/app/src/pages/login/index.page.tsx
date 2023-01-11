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

import styles from './index.module.scss';


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
  const { t } = useTranslation();

  // commons
  useCsrfToken(props.csrfToken);

  // page
  useCurrentPathname(props.currentPathname);

  const title = generateCustomTitle(props, t('login.title'));
  const classNames: string[] = ['login-page', styles['login-page']];

  return (
    <NoLoginLayout className={classNames.join(' ')}>
      <Head>
        <title>{title}</title>
      </Head>
      <LoginForm
        objOfIsExternalAuthEnableds={props.enabledStrategies}
        isLocalStrategySetup={props.isLocalStrategySetup}
        isLdapStrategySetup={props.isLdapStrategySetup}
        isLdapSetupFailed={props.isLdapSetupFailed}
        isEmailAuthenticationEnabled={props.isEmailAuthenticationEnabled}
        registrationWhiteList={props.registrationWhiteList}
        isPasswordResetEnabled={props.isPasswordResetEnabled}
        isMailerSetup={props.isMailerSetup}
        registrationMode={props.registrationMode}
        externalAccountLoginError={props.externalAccountLoginError}
      />
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
