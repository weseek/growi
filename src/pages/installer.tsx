import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import GrowiLogo from '~/client/js/components/Icons/GrowiLogo';

import { CrowiRequest } from '~/interfaces/crowi-request';
import loggerFactory from '~/utils/logger';

import RawLayout from '../components/RawLayout';

// import {
//   useCurrentUser, useAppTitle, useSiteUrl, useConfidential,
//   useSearchServiceConfigured, useSearchServiceReachable,
// } from '../stores/context';


const logger = loggerFactory('growi:pages:installer');

type Props = {
  title: string,
};

const InstallerPage: NextPage<Props> = (props: Props) => {

  return (
    <RawLayout title={props.title}>
      <div id="page-wrapper">
        <div className="main container-fluid">

          <div className="row">
            <div className="col-md-12">
              <div className="login-header mx-auto">
                <div className="logo"><GrowiLogo /></div>
                <h1 className="my-3">GROWI</h1>

                <div className="login-form-errors px-3">
                  {/* {% if req.form.errors.length > 0 %}
                  <div class="alert alert-danger">
                    <ul class="mb-0">
                    {% for error in req.form.errors %}
                      <li>{{ error }}</li>
                    {% endfor %}
                    </ul>
                  </div>
                  {% endif %} */}
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div
                id="installer-form"
                data-user-name="{{ req.body.registerForm.username }}"
                data-name="{{ req.body.registerForm.name }}"
                data-email="{{ req.body.registerForm.email }}"
                data-csrf="{{ csrf() }}"
              >
              </div>
            </div>
          </div>

        </div>
      </div>
    </RawLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    customizeService,
  } = crowi;

  const props: Props = {
    // title: customizeService.generateCustomTitleForFixedPageName(t('installer.setup')),
    title: customizeService.generateCustomTitleForFixedPageName('Setup'),
  };

  return {
    props: {
      namespacesRequired: ['translation'],
      ...props,
    },
  };
};

export default InstallerPage;
