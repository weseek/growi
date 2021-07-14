import Link from 'next/link';
import RawLayout from '../components/RawLayout';
import GrowiPage from './[[...path]]'
const SearchPage = () => (
  <RawLayout title="Search Results | Next.js + TypeScript Example">
    <GrowiPage >
      <h1>Search Results</h1>
      <p>This is the search results page</p>
      <p>
        <Link href="/">
          <a>Go home</a>
        </Link>
      </p>
    </GrowiPage>
  </RawLayout>
);

export default SearchPage;
