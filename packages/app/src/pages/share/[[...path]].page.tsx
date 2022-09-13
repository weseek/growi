import React from 'react';

import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';

import { CrowiRequest } from '~/interfaces/crowi-request';


import {
  CommonProps, getServerSideCommonProps,
} from '../utils/commons';


type Props = CommonProps & {
  currentUser: any
};

const SharedPage: NextPage<Props> = (props: Props) => {
  return <>SharedPage</>;
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;

  const { user } = req;
  const result = await getServerSideCommonProps(context);

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }
  const props: Props = result.props as Props;
  if (user != null) {
    // props.currentUser = JSON.stringify(user.toObject());
    props.currentUser = JSON.stringify(user);
  }

  return {
    props,
  };
};

export default SharedPage;
