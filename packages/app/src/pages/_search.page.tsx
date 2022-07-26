import {
  NextPage, GetServerSideProps,
} from 'next';
import dynamic from 'next/dynamic';

const SearchPage: NextPage = () => {

  const PutbackPageModal = (): JSX.Element => {
    const PutbackPageModal = dynamic(() => import('../components/PutbackPageModal'), { ssr: false });
    return <PutbackPageModal />;
  };

  return (
    <>
      SearchPage
      <PutbackPageModal />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async() => {
  return {
    props: { },
  };
};

export default SearchPage;
