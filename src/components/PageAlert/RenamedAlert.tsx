import { VFC } from 'react';
import { useTranslation } from '~/i18n';

type Props = {
  renamedFrom: string,
}

export const RenamedAlert:VFC<Props> = (props:Props) => {
  const { t } = useTranslation();

  return (
    <div className="alert alert-pink d-edit-none py-3 px-4 d-flex align-items-center justify-content-between">
      <span>
        <strong>{ t('Moved') }:</strong> {t('page_page.notice.moved')} <code>{props.renamedFrom}</code> {t('page_page.notice.moved_period')}
      </span>
    </div>
  );
};
