import { useIsEnabledStaleNotification } from '../../stores/context'
import { useSWRxCurrentPage, useSWRxPageInfo } from '../../stores/page'
import { useTranslation } from 'react-i18next';

export const PageStaleAlert = ():JSX.Element => {
  const { t } = useTranslation()
  const { data: isEnabledStaleNotification } = useIsEnabledStaleNotification();
  const { data: pageData } = useSWRxCurrentPage();
  const { data: pageInfo } = useSWRxPageInfo(pageData?._id);
  const contentAge = pageInfo?.contentAge;

  if (!isEnabledStaleNotification) {
    return <></>
  }

  if( pageInfo == null || contentAge == null || contentAge === 0) {
    return <></>
  }

  let alertClass;
  switch (pageInfo.contentAge) {
    case 1:
      alertClass = "alert-info";
      break;
    case 2:
      alertClass = "alert-warning";
      break;
    default:
      alertClass = "alert-danger";
  }

  return (
    <div className={`alert ${alertClass}`}>
      <i className="icon-fw icon-hourglass"></i>
      <strong>{ t('page_page.notice.stale', { count: pageInfo.contentAge }) }</strong>
    </div>
  )
}
