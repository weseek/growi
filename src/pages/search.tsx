import Link from 'next/link';
import RawLayout from '../components/RawLayout';

const SearchPage = () => (
  <RawLayout title="Search Results | Next.js + TypeScript Example">
    <h1>Search Results</h1>
    <p>This is the search results page</p>
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>
  </RawLayout>
);

export default SearchPage;
