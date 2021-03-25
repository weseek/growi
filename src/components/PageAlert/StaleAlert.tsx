import { VFC } from 'react';
import { differenceInYears } from 'date-fns';
import { useTranslation } from '~/i18n';
import { useCurrentPageSWR } from '~/stores/page';

export const StaleAlert:VFC = () => {
  const { t } = useTranslation();
  const { data: currentPage } = useCurrentPageSWR();

  if (currentPage == null) {
    return null;
  }

  const countAge:number = differenceInYears(new Date(), new Date(currentPage.updatedAt));

  if (countAge === 0) {
    return null;
  }

  let alertColor: 'info' | 'warning' | 'danger';
  switch (countAge) {
    case 1:
      alertColor = 'info';
      break;
    case 2:
      alertColor = 'warning';
      break;
    default:
      alertColor = 'danger';
      break;
  }

  return (
    <div className={`alert alert-${alertColor}`}>
      <i className="icon-fw icon-hourglass" />
      <strong>{ t('page_page.notice.stale', { count: countAge }) }</strong>
    </div>
  );
};
