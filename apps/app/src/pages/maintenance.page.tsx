import type { IUser, IUserHasId } from '@growi/core';
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import { useCurrentUser } from '~/stores/context';

import {
  CommonProps, getServerSideCommonProps, getNextI18NextConfig,
} from './utils/commons';


type Props = CommonProps & {
  currentUser: IUser,
};

const MaintenancePage: NextPage<CommonProps> = (props: Props) => {
  const { t } = useTranslation();

  useCurrentUser(props.currentUser ?? null);

  const logoutHandler = async() => {
    try {
      await apiv3Post('/logout');
      window.location.reload();
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <div id="content-main" className="content-main container-lg">
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-md-6 mt-5">
            <div className="text-center">
              <h1><i className="icon-exclamation large"></i></h1>
              <h1 className="text-center">{ t('maintenance_mode.maintenance_mode') }</h1>
              <h3>{ t('maintenance_mode.growi_is_under_maintenance') }</h3>
              <hr />
              <div className="text-start">
                {props.currentUser?.admin
              && (
                <p>
                  <i className="icon-arrow-right"></i>
                  <a className="btn btn-link" href="/admin">{ t('maintenance_mode.admin_page') }</a>
                </p>
              )}
                {props.currentUser != null
                  ? (
                    <p>
                      <i className="icon-arrow-right"></i>
                      <a className="btn btn-link" onClick={logoutHandler} id="maintanounse-mode-logout">{ t('maintenance_mode.logout') }</a>
                    </p>
                  )
                  : (
                    <p>
                      <i className="icon-arrow-right"></i>
                      <a className="btn btn-link" href="/login">{ t('maintenance_mode.login') }</a>
                    </p>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;

  const result = await getServerSideCommonProps(context);

  if ('redirect' in result) {
    return { redirect: result.redirect };
  }

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  if (props.redirectDestination != null) {
    return {
      redirect: {
        permanent: false,
        destination: props.redirectDestination,
      },
    };
  }

  const { user } = req;
  if (user != null) {
    props.currentUser = user.toObject();
  }

  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default MaintenancePage;
