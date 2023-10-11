import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="py-5">
      <div className="container">
        <Link href="/" className="fs-3">
          WESEEK Blog
        </Link>
        <p className="mt-2 mb-0">WESEEKのエンジニアブログです</p>
      </div>
    </header>
  );
};

export default Header;
