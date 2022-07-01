import React, { Component } from 'react';

import { isValidObjectId } from 'mongoose';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { classicNameResolver } from 'typescript';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { IPageWithMeta } from '~/interfaces/page';
import { PageModel } from '~/server/models/page';

import { BasicLayout } from '../components/BasicLayout';
import LoginForm from '../components/LoginForm';
import {
  useAppTitle, useConfidential, useCsrfToken, useSiteUrl,
} from '../stores/context';
import loggerFactory from '../utils/logger';

import { CommonProps, getServerSideCommonProps, useCustomTitle } from './commons';

const logger = loggerFactory('growi:pages:all');

type Props = CommonProps & {
  currentUser: string,
  username: string,
  email: string,

  pageWithMetaStr: string,

  isForbidden: boolean,
  isNotFound: boolean,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
};

async function injectPageInformation(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const Page = crowi.model('Page');
  const { pageService } = crowi;

  const { user } = req;

  const { currentPathname } = props;
  console.log('What is the current pathName\n', currentPathname);

  const pageIdStr = currentPathname.substring(1);
  console.log('What is the pageIdStr and is it valid\n', pageIdStr, isValidObjectId(pageIdStr));
  const pageId = isValidObjectId(pageIdStr) ? pageIdStr : null;
  console.log('What is the pageId here\n', pageId);

  const result: IPageWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, '/', user, true);
  const page = result.data;

  if (page == null) {
    const count = pageId != null ? await Page.count({ _id: pageId }) : await Page.count({ path: currentPathname });
    // check the page is forbidden or just does not exist.
    props.isForbidden = count > 0;
    props.isNotFound = true;
    logger.warn(`Page is ${props.isForbidden ? 'forbidden' : 'not found'}`, currentPathname);
  }

  await (page as unknown as PageModel).populateDataToShowRevision();
  props.pageWithMetaStr = JSON.stringify(result);
}

const LoginPage: NextPage<Props> = (props: Props) => {
  const router = useRouter();

  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);

  useConfidential(props.confidential);

  const classNames: string[] = [];
  return (
    <>
      <Head>

      </Head>
      <BasicLayout title="konnichia" className={classNames.join(' ')}>
        <header className="py-0">
          This is the LoginPage
        </header>
        <div className="col-md-12">
          <LoginForm
            registrationMode="aaaaaa"
            name={props.currentUser}
            username={props.username}
            email={props.email}
          />
        </div>
      </BasicLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, searchService, configManager, aclService, slackNotificationService, mailService,
  } = crowi;

  const { user } = req;
  console.log('Who is the user\n', user);

  const result = await getServerSideCommonProps(context);

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;
  await injectPageInformation(context, props);

  if (user != null) {
    props.currentUser = JSON.stringify(user);
    props.username = user.username;
    props.email = user.email;
  }

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

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
