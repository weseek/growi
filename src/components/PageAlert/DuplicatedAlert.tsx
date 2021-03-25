import { useRouter } from 'next/router';
import { VFC } from 'react';
import { useTranslation } from '~/i18n';

export const DuplicatedAlert:VFC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { duplicated } = router.query;

  if (duplicated == null) {
    return null;
  }

  return (
    <div className="alert alert-success py-3 px-4">
      <strong>
        { t('Duplicated') }: {t('page_page.notice.duplicated')} <code>{duplicated}</code> {t('page_page.notice.duplicated_period')}
      </strong>
    </div>
  );
};
