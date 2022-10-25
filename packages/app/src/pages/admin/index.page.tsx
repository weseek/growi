import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminHomeContainer from '~/client/services/AdminHomeContainer';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });
const AdminHome = dynamic(() => import('~/components/Admin/AdminHome/AdminHome'), { ssr: false });


type Props = CommonProps & {
  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
  installedPlugins: any,
};


const AdminHomePage: NextPage<Props> = (props) => {
  const { t } = useTranslation();

  const title = t('wiki_management_home_page');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminHomeContainer = new AdminHomeContainer();

    injectableContainers.push(adminHomeContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
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


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminHomePage;
