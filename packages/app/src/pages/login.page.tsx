import React from 'react';

import { pagePathUtils } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { RawLayout } from '~/components/Layout/RawLayout';
import LoginForm from '~/components/LoginForm';

import {
  useCurrentPagePath, useCsrfToken,
  useAppTitle, useSiteUrl, useConfidential,
} from '../stores/context';


import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, useCustomTitle,
} from './commons';

const { isTrashPage: _isTrashPage } = pagePathUtils;

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

type Props = CommonProps & {

  pageWithMetaStr: string,
};

const LoginPage: NextPage<Props> = (props: Props) => {

  // commons
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  useConfidential(props.confidential);
  useCsrfToken(props.csrfToken);

  // page
  useCurrentPagePath(props.currentPathname);

  const classNames: string[] = [];

  return (
    <>
      <RawLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
        <div id="page-wrapper">
          <div className="main container-fluid">

            <div className="row">
              <div className="col-md-12">
                <div className="login-header mx-auto">
                  <h1 className="my-3">GROWI</h1>
                </div>
              </div>
              <div className="col-md-12">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </RawLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default LoginPage;

// import {
//   NextPage, GetServerSideProps, GetServerSidePropsContext,
// } from 'next';

// import { useTranslation } from '~/i18n';

// import { CrowiRequest } from '~/interfaces/crowi-request';
// import GrowiLogo from '~/client/js/components/Icons/GrowiLogo';
// import LoginForm from '~/client/js/components/LoginForm';

// import { useCsrfToken } from '~/stores/context';
// import loggerFactory from '~/utils/logger';
// import { CommonProps, getServerSideCommonProps, useCustomTitle } from '~/utils/nextjs-page-utils';

// import RawLayout from '../components/RawLayout';

// // import {
// //   useCurrentUser, useAppTitle, useSiteUrl, useConfidential,
// //   useSearchServiceConfigured, useSearchServiceReachable,
// // } from '../stores/context';


// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const logger = loggerFactory('growi:pages:login');

// type Props = CommonProps & {
//   csrfToken: string,

//   appTitle: string,

//   registrationMode: string,
//   isRegistrationEnabled: boolean,
//   registrationWhiteList: string[],
//   setupedStrategies: string[],
//   enabledStrategies: string[],
// };

// const LoginPage: NextPage<Props> = (props: Props) => {

//   const { t } = useTranslation();
//   const title = useCustomTitle(props, t('Sign in'));

//   useCsrfToken(props.csrfToken);

//   const { appTitle } = props;

//   return (
//     <RawLayout title={title}>
//       <div id="page-wrapper">
//         <div className="main container-fluid">

//           <div className="row">
//             <div className="col-md-12">
//               <div className="login-header mx-auto">
//                 <div className="logo mb-3"><GrowiLogo /></div>
//                 <h1>{appTitle}</h1>
//               </div>
//             </div>
//             <div className="col-md-12">
//               <LoginForm
//                 registrationMode={props.registrationMode}
//                 isRegistrationEnabled={props.isRegistrationEnabled}
//                 registrationWhiteList={props.registrationWhiteList}
//                 setupedStrategies={props.setupedStrategies}
//                 enabledStrategies={props.enabledStrategies}
//               />
//             </div>
//           </div>

//         </div>
//       </div>
//     </RawLayout>
//   );
// };

// function injectSetupedStrategies(context: GetServerSidePropsContext, props: Props): void {
//   const req: CrowiRequest = context.req as CrowiRequest;
//   const { crowi } = req;
//   const {
//     passportService,
//   } = crowi;

//   const setupedStrategies: string[] = [];
//   if (passportService.isLocalStrategySetup) {
//     setupedStrategies.push('local');
//   }
//   if (passportService.isLdapStrategySetup) {
//     setupedStrategies.push('ldap');
//   }

//   props.setupedStrategies = setupedStrategies;
// }

// function injectEnabledStrategies(context: GetServerSidePropsContext, props: Props): void {
//   const req: CrowiRequest = context.req as CrowiRequest;
//   const { crowi } = req;
//   const {
//     configManager,
//   } = crowi;

//   const enabledStrategies: string[] = [];
//   if (configManager.getConfig('crowi', 'security:passport-google:isEnabled')) {
//     enabledStrategies.push('google');
//   }
//   if (configManager.getConfig('crowi', 'security:passport-github:isEnabled')) {
//     enabledStrategies.push('github');
//   }
//   if (configManager.getConfig('crowi', 'security:passport-facebook:isEnabled')) {
//     enabledStrategies.push('facebook');
//   }
//   if (configManager.getConfig('crowi', 'security:passport-twitter:isEnabled')) {
//     enabledStrategies.push('twitter');
//   }
//   if (configManager.getConfig('crowi', 'security:passport-saml:isEnabled')) {
//     enabledStrategies.push('saml');
//   }
//   if (configManager.getConfig('crowi', 'security:passport-oidc:isEnabled')) {
//     enabledStrategies.push('oidc');
//   }
//   if (configManager.getConfig('crowi', 'security:passport-basic:isEnabled')) {
//     enabledStrategies.push('basic');
//   }

//   props.enabledStrategies = enabledStrategies;
// }

// export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
//   const req: CrowiRequest = context.req as CrowiRequest;
//   const { crowi } = req;
//   const {
//     configManager, passportService,
//   } = crowi;

//   const result = await getServerSideCommonProps(context);

//   // check for presence
//   // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
//   if (!('props' in result)) {
//     throw new Error('invalid getSSP result');
//   }

//   const props: Props = result.props as Props;

//   // inject csrf token
//   props.csrfToken = req.csrfToken();

//   props.registrationMode = configManager.getConfig('crowi', 'security:registrationMode');
//   props.isRegistrationEnabled = passportService.isLocalStrategySetup && props.registrationMode !== 'Closed';
//   props.registrationWhiteList = configManager.getConfig('crowi', 'security:registrationWhiteList');

//   injectSetupedStrategies(context, props);
//   injectEnabledStrategies(context, props);

//   return {
//     props: {
//       ...props,
//       namespacesRequired: ['translation'], // TODO: override with login namespace
//     },
//   };
// };

// export default LoginPage;
