import React from 'react';

import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps,
} from './utils/commons';

type Props = CommonProps & {
  errorCode: string
};

const ForgotPasswordErrorsPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();

  return (
    <>forgot-password-errors</>
  );
};

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

  const errorCode = context.query.errorCode;
  if (typeof errorCode === 'string') {
    props.errorCode = errorCode;
  }

  // Direct access to '/forgot-password-errors' redirects to '/'
  if (props.errorCode == null) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default ForgotPasswordErrorsPage;
