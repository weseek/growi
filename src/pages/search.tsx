import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import Link from 'next/link';
import { i18n, config, useTranslation } from '~/i18n';
import { CrowiRequest } from '~/interfaces/crowi-request';

import { CommonProps, getServerSideCommonProps, useCustomTitle } from '~/utils/nextjs-page-utils';
import BasicLayout from '../components/BasicLayout'

import {
  useCurrentUser, useSearchServiceConfigured
} from '../stores/context';

type Props = CommonProps & {
  currentUser: any,

  page: any,
  isAbleToDeleteCompletely: boolean,
  isSearchServiceConfigured: boolean,
}
const SearchPage: NextPage<Props> = (props: Props) => {

  const { t } = useTranslation();
  // Todo: 検索結果ページ用の翻訳追加
  const title = useCustomTitle(props, t('SearchResult'));

  useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);
  useSearchServiceConfigured(props.isSearchServiceConfigured)

  // load all languages
  i18n.loadLanguages(config.allLanguages);

  return (
    <>
      <BasicLayout title={title}>
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
  const req: CrowiRequest = context.req as CrowiRequest;

  const { crowi } = req;
  const { searchService } = crowi;

  const { user } = req;

  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;
  if (user != null) {
    props.currentUser = JSON.stringify(user.toObject());
  }

  props.isSearchServiceConfigured = searchService.isConfigured;

  return {
    props: {
      ...props,
      namespacesRequired: ['translation'], // TODO: override with installer namespace
    },
  };
}

export default SearchPage;
