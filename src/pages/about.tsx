import Link from 'next/link';
import RawLayout from '../components/RawLayout';

const AboutPage = () => (
  <RawLayout title="About | Next.js + TypeScript Example">
    <h1>About</h1>
    <p>This is the about page</p>
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>
  </RawLayout>
);

export default AboutPage;
