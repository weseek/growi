import { useEffect, useMemo } from 'react';

import type {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import type { Container } from 'unstated';
import { Provider } from 'unstated';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { CommonProps } from '~/pages/utils/commons';
import { generateCustomTitle } from '~/pages/utils/commons';
import {
  useCurrentUser, useGrowiCloudUri, useGrowiAppIdForGrowiCloud,
} from '~/stores-universal/context';


import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const AdminHome = dynamic(() => import('~/client/components/Admin/AdminHome/AdminHome'), { ssr: false });
const ForbiddenPage = dynamic(() => import('~/client/components/Admin/ForbiddenPage').then(mod => mod.ForbiddenPage), { ssr: false });


type Props = CommonProps & {
  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
  installedPlugins: any,
  growiCloudUri: string,
  growiAppIdForGrowiCloud: number,
};


const AdminHomepage: NextPage<Props> = (props) => {
  useCurrentUser(props.currentUser ?? null);
  useGrowiCloudUri(props.growiCloudUri);
  useGrowiAppIdForGrowiCloud(props.growiAppIdForGrowiCloud);

  const { t } = useTranslation('admin');

  const title = generateCustomTitle(props, t('wiki_management_homepage'));

  const injectableContainers: Container<any>[] = useMemo(() => [], []);

  useEffect(() => {
    (async() => {
      const AdminHomeContainer = (await import('~/client/services/AdminHomeContainer')).default;
      const adminHomeContainer = new AdminHomeContainer();
      injectableContainers.push(adminHomeContainer);
    })();
  }, [injectableContainers]);

  if (props.isAccessDeniedForNonAdminUser) {
    return <ForbiddenPage />;
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={title}>
        <Head>
          <title>{title}</title>
        </Head>
        <AdminHome
          nodeVersion={props.nodeVersion}
          npmVersion={props.npmVersion}
          yarnVersion={props.yarnVersion}
          installedPlugins={props.installedPlugins}
        />
      </AdminLayout>
    </Provider>
  );
};


const injectServerConfigurations = async(context: GetServerSidePropsContext, props: Props): Promise<void> => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;

  props.nodeVersion = crowi.runtimeVersions.versions.node ? crowi.runtimeVersions.versions.node.version.version : null;
  props.npmVersion = crowi.runtimeVersions.versions.npm ? crowi.runtimeVersions.versions.npm.version.version : null;
  props.pnpmVersion = crowi.runtimeVersions.versions.pnpm ? crowi.runtimeVersions.versions.pnpm.version.version : null;
  props.growiCloudUri = await crowi.configManager.getConfig('crowi', 'app:growiCloudUri');
  props.growiAppIdForGrowiCloud = await crowi.configManager.getConfig('crowi', 'app:growiAppIdForCloud');
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context, injectServerConfigurations);
  return props;
};


export default AdminHomepage;
