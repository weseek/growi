import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { DrawioViewerScript } from '~/components/Script/DrawioViewerScript';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { RendererConfig } from '~/interfaces/services/renderer';
import type { IUser, IUserHasId } from '~/interfaces/user';
import {
  useCsrfToken, useCurrentUser, useIsSearchPage, useIsSearchScopeChildrenAsDefault,
  useIsSearchServiceConfigured, useIsSearchServiceReachable, useRendererConfig,
} from '~/stores/context';

import type { CommonProps } from './utils/commons';
import {
  getNextI18NextConfig, getServerSideCommonProps, generateCustomTitle, useInitSidebarConfig,
} from './utils/commons';

const SearchResultLayout = dynamic(() => import('~/components/Layout/SearchResultLayout'), { ssr: false });

type Props = CommonProps & {
  currentUser: IUser,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,

  // Render config
  rendererConfig: RendererConfig,

};

const PrivateLegacyPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();

  const PrivateLegacyPages = dynamic(() => import('~/components/PrivateLegacyPages'), { ssr: false });

  // commons
  useCsrfToken(props.csrfToken);

  useCurrentUser(props.currentUser ?? null);

  // Search
  useIsSearchPage(true);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  // render config
  useRendererConfig(props.rendererConfig);

  const title = generateCustomTitle(props, t('private_legacy_pages.title'));

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <DrawioViewerScript />

      <SearchResultLayout>
        <div id="private-regacy-pages">
          <PrivateLegacyPages />
        </div>
      </SearchResultLayout>
    </>
  );
};

async function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { configManager, searchService } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.sidebarConfig = {
    isSidebarDrawerMode: configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
    isSidebarClosedAtDockMode: configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
  };

  props.rendererConfig = {
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    drawioUri: configManager.getConfig('crowi', 'app:drawioUri'),
    plantumlUri: configManager.getConfig('crowi', 'app:plantumlUri'),
    blockdiagUri: process.env.BLOCKDIAG_URI ?? null,

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention'),
    xssOption: configManager.getConfig('markdown', 'markdown:rehypeSanitize:option'),
    attrWhiteList: JSON.parse(crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes')),
    tagWhiteList: crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames'),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };
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

  await injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default PrivateLegacyPage;
