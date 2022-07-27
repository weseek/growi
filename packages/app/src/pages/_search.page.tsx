import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { BasicLayout } from '~/components/Layout/BasicLayout';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { RendererConfig } from '~/interfaces/services/renderer';
import { ISidebarConfig } from '~/interfaces/sidebar-config';
import { IUser, IUserHasId } from '~/interfaces/user';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
import UserUISettings from '~/server/models/user-ui-settings';
import {
  useCurrentUser,
  useIsSearchPage, useIsSearchScopeChildrenAsDefault, useIsSearchServiceConfigured, useIsSearchServiceReachable, useRendererConfig,
} from '~/stores/context';
import {
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
} from '~/stores/ui';

import { CommonProps, getServerSideCommonProps, useCustomTitle } from './utils/commons';

type Props = CommonProps & {
  currentUser: IUser,

  disableLinkSharing: boolean,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  // UI
  userUISettings?: IUserUISettings
  // Sidebar
  sidebarConfig: ISidebarConfig,

  // Render config
  rendererConfig: RendererConfig,

};

const SearchPage: NextPage<Props> = (props: Props) => {
  const { userUISettings } = props;

  useCurrentUser(props.currentUser ?? null);

  useIsSearchPage(true);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  // UserUISettings
  usePreferDrawerModeByUser(userUISettings?.preferDrawerModeByUser ?? props.sidebarConfig.isSidebarDrawerMode);
  usePreferDrawerModeOnEditByUser(userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(userUISettings?.isSidebarCollapsed ?? props.sidebarConfig.isSidebarClosedAtDockMode);
  useCurrentSidebarContents(userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(userUISettings?.currentProductNavWidth);

  // render config
  useRendererConfig(props.rendererConfig);

  const PutbackPageModal = (): JSX.Element => {
    const PutbackPageModal = dynamic(() => import('../components/PutbackPageModal'), { ssr: false });
    return <PutbackPageModal />;
  };

  const classNames: string[] = [];
  // if (props.isContainerFluid) {
  //   classNames.push('growi-layout-fluid');
  // }

  return (
    <>
      <Head>
        {/*
        {renderScriptTagByName('drawio-viewer')}
        {renderScriptTagByName('highlight-addons')}
        */}
      </Head>
      <BasicLayout title={useCustomTitle(props, 'Search')} className={classNames.join(' ')}>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
        <div id="main" className="main search-page mt-0">

          <div id="search-page">
            {/* render SearchPage component here */}
          </div>

        </div>
        <PutbackPageModal />
      </BasicLayout>

    </>
  );
};

async function injectUserUISettings(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;

  const userUISettings = user == null ? null : await UserUISettings.findOne({ user: user._id }).exec();
  if (userUISettings != null) {
    props.userUISettings = userUISettings.toObject();
  }
}

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { configManager, searchService } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.disableLinkSharing = configManager.getConfig('crowi', 'security:disableLinkSharing');

  props.sidebarConfig = {
    isSidebarDrawerMode: configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
    isSidebarClosedAtDockMode: configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
  };

  props.rendererConfig = {
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    plantumlUri: process.env.PLANTUML_URI ?? null,
    blockdiagUri: process.env.BLOCKDIAG_URI ?? null,

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention'),
    attrWhiteList: crowi.xssService.getAttrWhiteList(),
    tagWhiteList: crowi.xssService.getTagWhiteList(),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;

  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  if (user != null) {
    props.currentUser = user.toObject();
  }

  await injectUserUISettings(context, props);
  injectServerConfigurations(context, props);
  console.log(props.rendererConfig);
  return {
    props,
  };
};

export default SearchPage;
