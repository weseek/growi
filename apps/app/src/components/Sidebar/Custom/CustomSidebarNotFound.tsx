import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export const SidebarNotFound = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="grw-sidebar-content-header h5 text-center py-3">
      <Link href="/Sidebar#edit">
        <i className="icon-fw icon-magic-wand"></i>
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: t('Create Sidebar Page') }}></span>
      </Link>
    </div>
  );
};
