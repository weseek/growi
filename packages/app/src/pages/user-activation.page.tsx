import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import CompleteUserRegistrationForm from '~/components/CompleteUserRegistrationForm';
import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { UserActivationErrorCode } from '~/interfaces/errors/user-activation';
import type { RegistrationMode } from '~/interfaces/registration-mode';
import { IUserRegistrationOrder } from '~/server/models/user-registration-order';

import {
  getServerSideCommonProps, getNextI18NextConfig, generateCustomTitle, CommonProps,
} from './utils/commons';

type Props = CommonProps & {
  token: string
  email: string
  errorCode?: UserActivationErrorCode
  registrationMode: RegistrationMode
  isEmailAuthenticationEnabled: boolean
}

const UserActivationPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();

  const title = generateCustomTitle(props, t('User Activation'));

  return (
    <NoLoginLayout>
      <Head>
        <title>{title}</title>
      </Head>
      <CompleteUserRegistrationForm
        token={props.token}
        email={props.email}
        errorCode={props.errorCode}
        registrationMode={props.registrationMode}
        isEmailAuthenticationEnabled={props.isEmailAuthenticationEnabled}
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
  const req: CrowiRequest = context.req as CrowiRequest;

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

  if (typeof context.query.errorCode === 'string') {
    props.errorCode = context.query.errorCode as UserActivationErrorCode;
  }

  props.registrationMode = req.crowi.configManager.getConfig('crowi', 'security:registrationMode');
  props.isEmailAuthenticationEnabled = req.crowi.configManager.getConfig('crowi', 'security:passport-local:isEmailAuthenticationEnabled');

  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default UserActivationPage;
