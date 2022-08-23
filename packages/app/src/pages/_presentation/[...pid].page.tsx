import { pagePathUtils } from '@growi/core';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { IRevision } from '~/interfaces/revision';
import { IUser, IUserHasId } from '~/interfaces/user';

import { CommonProps, getServerSideCommonProps } from '../utils/commons';

const { isPermalink: _isPermalink } = pagePathUtils;

type Props = CommonProps & {
  shouldRedirectTo: string | undefined;

  currentUser: IUser;
  revision: IRevision;
};

const GrowiPage: NextPage<Props> = (props: Props) => {
  return (
    <>
      <div className="reveal">
        <div className="slides">
          {props.revision.body}
        </div>
      </div>
    </>
  );
};

async function injectRevisionData(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const pid = context.query.pid as string[] | undefined;
  // redirect
  if (pid == null) {
    props.shouldRedirectTo = '/';
    return;
  }

  const pageId: string = pid[0];
  const path = `/${pageId}`;
  const isPermalink = _isPermalink(path);
  // redirect
  if (!isPermalink) {
    props.shouldRedirectTo = path;
    return;
  }

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;

  const Revision = crowi.model('Revision');
  const revision = await Revision.findOne({ pageId });
  // redirect
  if (revision == null) {
    props.shouldRedirectTo = path;
    return;
  }

  props.revision = revision.toObject();
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const result = await getServerSideCommonProps(context);


  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  await injectRevisionData(context, props);

  if (props.shouldRedirectTo != null) {
    return {
      redirect: {
        destination: props.shouldRedirectTo,
        permanent: false,
      },
    };
  }

  return {
    props,
  };

};

export default GrowiPage;
