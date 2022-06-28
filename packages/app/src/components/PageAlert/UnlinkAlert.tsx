import { useTranslation } from 'react-i18next';
import { useCurrentURLSearchParams } from '~/stores/context';

export const UnlinkAlert = (): JSX.Element => {
  const { t } = useTranslation();

  const {data: currentSearchParams } = useCurrentURLSearchParams()
  if (currentSearchParams == null || !currentSearchParams.has('unlinked')) {
    return <></>
  }

  return (
    <div className="alert alert-info d-edit-none py-3 px-4">
    <strong>{ t('Unlinked') }: </strong> { t('page_page.notice.unlinked') }
  </div>
  )
}
