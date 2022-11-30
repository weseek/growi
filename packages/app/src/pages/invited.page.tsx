import React from 'react';

import type { IUserHasId, IUser } from '@growi/core';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

import { InvitedFormProps } from '~/components/InvitedForm';
import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';
import type { CrowiRequest } from '~/interfaces/crowi-request';

import { useCsrfToken, useCurrentPathname, useCurrentUser } from '../stores/context';

import {
  CommonProps, getServerSideCommonProps, useCustomTitle, getNextI18NextConfig,
} from './utils/commons';

const InvitedForm = dynamic<InvitedFormProps>(() => import('~/components/InvitedForm').then(mod => mod.InvitedForm), { ssr: false });

type Props = CommonProps & {
  currentUser: IUser,
  invitedFormUsername: string,
  invitedFormName: string,
}

const InvitedPage: NextPage<Props> = (props: Props) => {

  useCsrfToken(props.csrfToken);
  useCurrentPathname(props.currentPathname);
  useCurrentUser(props.currentUser);

  const classNames: string[] = ['invited-page'];

  return (
    <NoLoginLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
      <InvitedForm invitedFormUsername={props.invitedFormUsername} invitedFormName={props.invitedFormName} />
    </NoLoginLayout>
  );

};

async function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { body: invitedForm } = req;

  if (props.invitedFormUsername != null) {
    props.invitedFormUsername = invitedForm.username;
  }
  if (props.invitedFormName != null) {
    props.invitedFormName = invitedForm.name;
  }
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

  return { props };
};

export default InvitedPage;
