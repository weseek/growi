import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CompleteUserRegistrationForm from '~/components/CompleteUserRegistrationForm';
import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';
import { IUserRegistrationOrder } from '~/server/models/user-registration-order';

import {
  getServerSideCommonProps, getNextI18NextConfig, useCustomTitle, CommonProps,
} from './utils/commons';

type Props = CommonProps & {
  token: string
  email: string
}

const UserActivationPage: NextPage<Props> = (props: Props) => {
  return (
    <NoLoginLayout title={useCustomTitle(props, 'GROWI')}>
      <CompleteUserRegistrationForm
        token={props.token}
        email={props.email}
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

  if (context.query.userRegistrationOrder != null) {
    const userRegistrationOrder = context.query.userRegistrationOrder as unknown as IUserRegistrationOrder;
    props.email = userRegistrationOrder.email;
    props.token = userRegistrationOrder.token;
  }

  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default UserActivationPage;
