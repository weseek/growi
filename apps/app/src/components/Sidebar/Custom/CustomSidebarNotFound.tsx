import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export const SidebarNotFound = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="grw-sidebar-content-header h5 text-center py-3">
      <Link href="/Sidebar#edit">
        <span className="material-symbols-outlined">edit_note</span>
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: t('Create Sidebar Page') }}></span>
      </Link>
    </div>
  );
};
