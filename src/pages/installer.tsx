import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';

import { i18n, config, useTranslation } from '~/i18n';

import GrowiLogo from '~/client/js/components/Icons/GrowiLogo';
import InstallerForm from '~/client/js/components/InstallerForm';

import loggerFactory from '~/utils/logger';
import { CommonProps, getServerSideCommonProps, useCustomTitle } from '~/utils/nextjs-page-utils';

import RawLayout from '../components/RawLayout';

// import {
//   useCurrentUser, useAppTitle, useSiteUrl, useConfidential,
//   useSearchServiceConfigured, useSearchServiceReachable,
// } from '../stores/context';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:pages:installer');

type Props = CommonProps & {
};

const InstallerPage: NextPage<Props> = (props: Props) => {

  const { t } = useTranslation();
  const title = useCustomTitle(props, t('installer.setup'));

  // load all languages
  i18n.loadLanguages(config.allLanguages);

  return (
    <RawLayout title={title}>
      <div id="page-wrapper">
        <div className="main container-fluid">

          <div className="row">
            <div className="col-md-12">
              <div className="login-header mx-auto">
                <div className="logo"><GrowiLogo /></div>
                <h1 className="my-3">GROWI</h1>
              </div>
            </div>
            <div className="col-md-12">
              <InstallerForm />
            </div>
          </div>

        </div>
      </div>
    </RawLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const { props } = result;

  return {
    props: {
      ...props,
      namespacesRequired: ['translation'], // TODO: override with installer namespace
    },
  };
};

export default InstallerPage;
