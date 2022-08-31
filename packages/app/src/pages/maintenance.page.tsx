import {
  IUser, IUserHasId,
} from '@growi/core';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { useCurrentUser } from '~/stores/context';

import {
  CommonProps, getServerSideCommonProps, getNextI18NextConfig,
} from './utils/commons';

type Props = CommonProps & {
  currentUser: IUser,
};

const MaintenancePage: NextPage<CommonProps> = (props: Props) => {

  const MaintenaceMode = dynamic(() => import('~/components/MaintenanceMode').then(mod => mod.MaintenanceMode), { ssr: false });

  useCurrentUser(props.currentUser ?? null);

  return (
    <>
      <MaintenaceMode />
    </>
  );
};

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;

  const { user } = req;
  const result = await getServerSideCommonProps(context);

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }
  const props: Props = result.props as Props;

  if (user != null) {
    props.currentUser = user.toObject();
  }

  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default MaintenancePage;
