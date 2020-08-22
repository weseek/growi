import Link from 'next/link';

import { NextPage } from 'next';

import nextI18Next from '~/i18n';

import Layout from '../components/Layout';

const IndexPage: NextPage = () => {
  const { t } = nextI18Next.useTranslation();

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
    </Layout>
  );
};

IndexPage.getInitialProps = async() => ({
  namespacesRequired: ['translation'],
});

export default IndexPage;
