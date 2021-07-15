import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import Link from 'next/link';
import { i18n, config, useTranslation } from '~/i18n';


import { CommonProps, getServerSideCommonProps, useCustomTitle } from '~/utils/nextjs-page-utils';

import BasicLayout from '../components/BasicLayout'

type Props = CommonProps & {

}
const SearchPage: NextPage<Props> = (props: Props) => {

  const { t } = useTranslation();
  // Todo: 検索結果ページ用の翻訳追加
  const title = useCustomTitle(props, t('installer.setup'));

  // load all languages
  i18n.loadLanguages(config.allLanguages);

  return (
    <>
      <BasicLayout title="Search Results">
        <h1>Search Results</h1>
        <p>This is the search results page</p>
        <p>
          <Link href="/">
            <a>Go home</a>
          </Link>
        </p>
      </BasicLayout>
    </>
  )
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
}

export default SearchPage;
