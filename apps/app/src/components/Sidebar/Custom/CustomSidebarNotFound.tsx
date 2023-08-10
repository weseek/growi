import Link from 'next/link';

export const SidebarNotFound = (): JSX.Element => {
  return (
    <div className="grw-sidebar-content-header h5 text-center py-3">
      <Link href="/Sidebar#edit">
        <i className="icon-magic-wand"></i>Create<strong>/Sidebar</strong>page
      </Link>
    </div>
  );
};
