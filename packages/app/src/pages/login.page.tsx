import React from 'react';


import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';

import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';
import { LoginFormProps } from '~/components/LoginForm';
import { CrowiRequest } from '~/interfaces/crowi-request';

import {
  useCsrfToken,
  useCurrentPathname,
} from '../stores/context';


import {
  CommonProps, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';

const LoginForm = dynamic<LoginFormProps>(() => import('~/components/LoginForm').then(mod => mod.LoginForm), { ssr: false });

type Props = CommonProps & {

  pageWithMetaStr: string,
  isMailerSetup: boolean,
  enabledStrategies: unknown,
  registrationWhiteList: string[],
};

const LoginPage: NextPage<Props> = (props: Props) => {

  // commons
  useCsrfToken(props.csrfToken);

  // page
  useCurrentPathname(props.currentPathname);

  const classNames: string[] = ['login-page'];

  return (
    <NoLoginLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
      <LoginForm
        // Todo: These props should be set properly. https://redmine.weseek.co.jp/issues/104847
        objOfIsExternalAuthEnableds={props.enabledStrategies}
        isLocalStrategySetup={true}
        isLdapStrategySetup={true}
        isEmailAuthenticationEnabled={false}
        isRegistrationEnabled={true}
        registrationWhiteList={props.registrationWhiteList}
        isPasswordResetEnabled={true}
        isMailerSetup={false}
      />
    </NoLoginLayout>
  );
};

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
    smal: configManager.getConfig('crowi', 'security:passport-saml:isEnabled'),
    oidc: configManager.getConfig('crowi', 'security:passport-oidc:isEnabled'),
    basic: configManager.getConfig('crowi', 'security:passport-basic:isEnabled'),
  };

  props.enabledStrategies = enabledStrategies;
}

async function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    mailService,
    configManager,
  } = crowi;

  props.isMailerSetup = mailService.isMailerSetup;
  props.registrationWhiteList = configManager.getConfig('crowi', 'security:registrationWhiteList');
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

  return {
    props,
  };
};

export default LoginPage;
