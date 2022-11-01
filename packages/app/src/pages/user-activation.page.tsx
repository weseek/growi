import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CompleteUserRegistrationForm from '~/components/CompleteUserRegistrationForm';
import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';

import {
  getServerSideCommonProps, getNextI18NextConfig, useCustomTitle, CommonProps,
} from './utils/commons';

type Props = CommonProps & {
  //
}

const UserActivationPage: NextPage<Props> = (props: Props) => {
  return (
    <NoLoginLayout title={useCustomTitle(props, 'GROWI')}>
      <CompleteUserRegistrationForm
        token='token'
        email='admin@example.com'
      />
    </NoLoginLayout>
  );
};

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
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default UserActivationPage;
