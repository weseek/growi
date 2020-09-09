import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import Link from 'next/link';

import { useTranslation } from '~/i18n';

import { CrowiRequest } from '~/interfaces/crowi-request';
import loggerFactory from '~/utils/logger';

import Layout from '../components/Layout';

const logger = loggerFactory('growi:pages:all');

type Props = {
  page: any,
};

const GrowiPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();
  const page = JSON.parse(props.page);

  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <h1>Hello Next.js 👋</h1>
      <p>
        {t('Help')}
      </p>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p>
      <p>
        {page.revision.body}
      </p>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const PageModel = crowi.model('Page');
  const { pageService } = crowi;

  const pagePath: string = req.path;

  let page = await PageModel.findByPathAndViewer(pagePath, req.user);

  if (page == null) {
    // check the page is forbidden or just does not exist.
    const isForbidden = await PageModel.count({ path: pagePath }) > 0;
    logger.warn('Page is forbidden', pagePath);
  }
  if (page.redirectTo) {
    logger.debug(`Redirect to '${page.redirectTo}'`);
    // return res.redirect(`${encodeURI(page.redirectTo)}?redirectFrom=${encodeURIComponent(path)}`);
    return { props: {} };
  }

  await page.populateDataToShowRevision();
  page = pageService.serializeToObj(page);

  return {
    props: {
      namespacesRequired: ['translation'],
      page: JSON.stringify(page),
    },
  };
};

export default GrowiPage;
