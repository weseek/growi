import { useTranslation } from 'react-i18next';

export const UnlinkAlert = (props): JSX.Element => {
  const { t } = useTranslation();
  return (
    <div className="alert alert-info d-edit-none py-3 px-4">
    <strong>{ t('Unlinked') }: </strong> { t('page_page.notice.unlinked') }
  </div>
  )
}
