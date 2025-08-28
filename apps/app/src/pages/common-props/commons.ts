import type { ColorScheme, IUserHasId } from '@growi/core';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import { getGrowiVersion } from '~/utils/growi-version';

export type CommonInitialProps = {
  isNextjsRoutingTypeInitial: true,
  appTitle: string,
  siteUrl: string | undefined,
  confidential: string,
  growiVersion: string,
  isDefaultLogo: boolean,
  customTitleTemplate: string,
  growiCloudUri: string | undefined,
  forcedColorScheme?: ColorScheme,
};

export const getServerSideCommonInitialProps: GetServerSideProps<CommonInitialProps> = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, configManager, attachmentService, customizeService,
  } = crowi;

  const isCustomizedLogoUploaded = await attachmentService.isBrandLogoExist();
  const isDefaultLogo = crowi.configManager.getConfig('customize:isDefaultLogo') || !isCustomizedLogoUploaded;
  const forcedColorScheme = crowi.customizeService.forcedColorScheme;

  return {
    props: {
      isNextjsRoutingTypeInitial: true,
      appTitle: appService.getAppTitle(),
      siteUrl: configManager.getConfig('app:siteUrl'), // DON'T USE growiInfoService.getSiteUrl()
      confidential: appService.getAppConfidential() || '',
      growiVersion: getGrowiVersion(),
      isDefaultLogo,
      customTitleTemplate: customizeService.customTitleTemplate,
      growiCloudUri: configManager.getConfig('app:growiCloudUri'),
      forcedColorScheme,
    },
  };
};

export type CommonEachProps = {
  currentPathname: string,
  nextjsRoutingPage: string | null, // must be set by each page
  currentUser?: IUserHasId,
  csrfToken: string,
  isMaintenanceMode: boolean,
  redirectDestination?: string | null,
};


export const getServerSideCommonEachProps: GetServerSideProps<Omit<CommonEachProps, 'nextjsRoutingPage'>> = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest;
  const { crowi, user } = req;
  const { appService } = crowi;

  const url = new URL(context.resolvedUrl, 'http://example.com');
  const currentPathname = decodeURIComponent(url.pathname);

  const isMaintenanceMode = appService.isMaintenanceMode();

  let currentUser;
  if (user != null) {
    currentUser = user.toObject();
  }

  // Redirect destination for page transition by next/link
  let redirectDestination: string | null = null;
  if (!crowi.aclService.isGuestAllowedToRead() && currentUser == null) {
    redirectDestination = '/login';
  }
  else if (!isMaintenanceMode && currentPathname === '/maintenance') {
    redirectDestination = '/';
  }
  else if (isMaintenanceMode && !currentPathname.match('/admin/*') && !(currentPathname === '/maintenance')) {
    redirectDestination = '/maintenance';
  }
  else {
    redirectDestination = null;
  }

  return {
    props: {
      currentPathname,
      currentUser,
      csrfToken: req.csrfToken(),
      isMaintenanceMode,
      redirectDestination,
    },
  };
};
