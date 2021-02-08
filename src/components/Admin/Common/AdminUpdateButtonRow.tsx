import { FC } from 'react';
import { useTranslation } from '~/i18n';

type Props = {
  onClick?: ()=>void;
  disabled?: boolean;
}

export const AdminUpdateButtonRow:FC<Props> = (props:Props) => {
  const { t } = useTranslation();

  const handleUpdateButton = ():void => {
    if (props.onClick != null) {
      props.onClick();
    }
  };

  return (
    <div className="row my-3">
      <div className="mx-auto">
        <button type="button" className="btn btn-primary" onClick={handleUpdateButton} disabled={props.disabled || false}>{ t('Update') }</button>
      </div>
    </div>
  );
};
