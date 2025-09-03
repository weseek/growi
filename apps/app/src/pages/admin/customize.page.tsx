import { useEffect } from 'react';

import { useHydrateAtoms } from 'jotai/utils';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import {
  customizeTitleAtom,
  isCustomizedLogoUploadedAtom,
  useCustomizeTitle,
  useIsCustomizedLogoUploaded,
} from '~/states/global';

import type { NextPageWithLayout } from '../_app.page';
import { mergeGetServerSidePropsResults } from '../utils/server-side-props';

import type { AdminCommonProps } from './_shared';
import { createAdminPageLayout, getServerSideAdminCommonProps } from './_shared';

const CustomizeSettingContents = dynamic(() => import('~/client/components/Admin/Customize/Customize'), { ssr: false });

type PageProps = {
  customizeTitle?: string,
  isCustomizedLogoUploaded: boolean,
};

type Props = AdminCommonProps & PageProps;

// eslint-disable-next-line react/prop-types
const AdminCustomizeSettingsPage: NextPageWithLayout<Props> = ({ customizeTitle, isCustomizedLogoUploaded }) => {
  useHydrateAtoms([
    [customizeTitleAtom, customizeTitle],
    [isCustomizedLogoUploadedAtom, isCustomizedLogoUploaded],
  ], { dangerouslyForceHydrate: true });

  const [, setCustomizeTitle] = useCustomizeTitle();
  const [, setIsCustomizedLogoUploaded] = useIsCustomizedLogoUploaded();

  useEffect(() => { setCustomizeTitle(customizeTitle) }, [customizeTitle, setCustomizeTitle]);
  useEffect(() => { setIsCustomizedLogoUploaded(isCustomizedLogoUploaded) }, [isCustomizedLogoUploaded, setIsCustomizedLogoUploaded]);

  return <CustomizeSettingContents />;
};

AdminCustomizeSettingsPage.getLayout = createAdminPageLayout<Props>({
  title: (_p, t) => t('customize_settings.customize_settings'),
  containerFactories: [
    async() => {
      const C = (await import('~/client/services/AdminCustomizeContainer')).default;
      return new C();
    },
  ],
});

export const getServerSideProps: GetServerSideProps<Props> = async(context: GetServerSidePropsContext) => {
  const commonResult = await getServerSideAdminCommonProps(context);

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;

  const customizePropsFragment = {
    props: {
      customizeTitle: crowi.configManager.getConfig('customize:title'),
      isCustomizedLogoUploaded: await crowi.attachmentService.isBrandLogoExist(),
    },
  } satisfies { props: PageProps };

  return mergeGetServerSidePropsResults(commonResult, customizePropsFragment);
};

export default AdminCustomizeSettingsPage;
