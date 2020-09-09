import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import Link from 'next/link';

import { useTranslation } from '~/i18n';

import { CrowiRequest } from '~/interfaces/crowi-request';
import loggerFactory from '~/utils/logger';

import Layout from '../components/Layout';

const logger = loggerFactory('growi:pages:all');

type Props = {
  page: any,
  isForbidden: boolean,
};

const GrowiPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();

  let page: any;
  let header: string;

  if (props.page != null) {
    page = JSON.parse(props.page);
    header = page.path;
  }
  else {
    header = props.isForbidden ? 'Forbidden' : 'Not found';
  }

  return (
    <Layout title="GROWI">
      <h1>{header}</h1>
      { page && (
        <p>
          {page.revision.body}
        </p>
      ) }
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const PageModel = crowi.model('Page');
  const { pageService } = crowi;

  const { path, user } = req;

  // define props generator method
  const getPageAndCreateProps = async(pagePath: string): Promise<Props> => {
    const props: Props = {} as Props;

    const page = await PageModel.findByPathAndViewer(pagePath, user);

    if (page == null) {
      // check the page is forbidden or just does not exist.
      props.isForbidden = await PageModel.count({ path: pagePath }) > 0;
      logger.warn(`Page is ${props.isForbidden ? 'forbidden' : 'not found'}`, pagePath);
      return props;
    }

    // get props recursively
    if (page.redirectTo) {
      logger.debug(`Redirect to '${page.redirectTo}'`);
      return getPageAndCreateProps(page.redirectTo);
    }

    await page.populateDataToShowRevision();
    props.page = JSON.stringify(pageService.serializeToObj(page));

    return props;
  };

  const props: Props = await getPageAndCreateProps(path);

  return {
    props: {
      namespacesRequired: ['translation'],
      ...props,
    },
  };
};

export default GrowiPage;
