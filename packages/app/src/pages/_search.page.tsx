import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { BasicLayout } from '~/components/Layout/BasicLayout';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { IUser, IUserHasId } from '~/interfaces/user';
import {
  useCurrentUser,
  useIsSearchPage, useIsSearchScopeChildrenAsDefault, useIsSearchServiceConfigured, useIsSearchServiceReachable,
} from '~/stores/context';

import UnsavedAlertDialog from './UnsavedAlertDialog';
import { CommonProps, getServerSideCommonProps, useCustomTitle } from './utils/commons';

type Props = CommonProps & {
  currentUser: IUser,

  disableLinkSharing: boolean,

  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
};

const SearchPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();
  const title = useCustomTitle(props, t('search_result.title'));

  useCurrentUser(props.currentUser ?? null);

  useIsSearchPage(true);
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

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
      <BasicLayout title={title} className={classNames.join(' ')}>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
        <div id="main" className="main search-page mt-0">

          <div id="search-page">
            {/* render SearchPage component here */}
          </div>

        </div>
        <UnsavedAlertDialog />
        <PutbackPageModal />
      </BasicLayout>

    </>
  );
};

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const { configManager, searchService } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.disableLinkSharing = configManager.getConfig('crowi', 'security:disableLinkSharing');
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

  injectServerConfigurations(context, props);

  return {
    props,
  };
};

export default SearchPage;
