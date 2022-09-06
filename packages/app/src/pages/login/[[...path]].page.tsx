import React from 'react';

import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';
import { CrowiRequest } from '~/interfaces/crowi-request';

import { useCsrfToken, useCurrentPathname } from '../../stores/context';
import {
  CommonProps, getServerSideCommonProps, useCustomTitle, getNextI18NextConfig,
} from '../utils/commons';

const LoginForm = dynamic(() => import('~/components/LoginForm'), { ssr: false });
const InvitedForm = dynamic(() => import('~/components/Login/InvitedForm').then(mod => mod.InvitedForm), { ssr: false });

type Props = CommonProps & {
  pageWithMetaStr: string,
  isMailerSetup: boolean,
  enabledStrategies: unknown,
  registrationWhiteList: string[],
}

const LoginPage: NextPage<Props> = (props: Props) => {

  const router = useRouter();
  const { path } = router.query;
  const pagePathKeys: string[] = Array.isArray(path) ? path : ['login'];

  useCsrfToken(props.csrfToken);
  useCurrentPathname(props.currentPathname);

  const loginPagesMap = {
    login: {
      component: <LoginForm
        isLocalStrategySetup={true}
        isLdapStrategySetup={true}
        objOfIsExternalAuthEnableds={props.enabledStrategies}
        isRegistrationEnabled={true}
        isPasswordResetEnabled={true}
        registrationWhiteList={props.registrationWhiteList}
      />,
      classNames: ['login-page'],
    },
    invited: {
      component: <InvitedForm />,
      classNames: ['invited-page'],
    },
  };

  const getTargetPageToRender = (pagesMap, keys): {component: JSX.Element, classNames: string[]} => {
    return keys.reduce((pagesMap, key) => {
      return pagesMap[key];
    }, pagesMap);
  };

  const targetPage = getTargetPageToRender(loginPagesMap, pagePathKeys);

  return (
    <NoLoginLayout title={useCustomTitle(props, 'GROWI')} className={targetPage.classNames.join(' ')}>
      { targetPage.component }
    </NoLoginLayout>
  );

};

async function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { mailService, configManager } = crowi;

  props.isMailerSetup = mailService.isMailerSetup;
  props.registrationWhiteList = configManager.getConfig('crowi', 'security:registrationWhiteList');
}

function injectEnabledStrategies(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { configManager } = crowi;

  const enabledStrategies = {
    google: configManager.getConfig('crowi', 'security:passport-google:isEnabled'),
    github: configManager.getConfig('crowi', 'security:passport-github:isEnabled'),
    facebook: false,
    twitter: configManager.getConfig('crowi', 'security:passport-twitter:isEnabled'),
    smal: configManager.getConfig('crowi', 'security:passport-saml:isEnabled'),
    oidc: configManager.getConfig('crowi', 'security:passport-oidc:isEnabled'),
    basic: configManager.getConfig('crowi', 'security:passport-basic:isEnabled'),
  };

  props.enabledStrategies = enabledStrategies;
}

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

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  injectServerConfigurations(context, props);
  injectEnabledStrategies(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return { props };
};

export default LoginPage;
