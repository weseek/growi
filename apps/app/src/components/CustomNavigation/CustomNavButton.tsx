import { memo, type ReactNode } from 'react';

import { useTranslation } from 'next-i18next';

import styles from './CustomNavButton.module.scss';

const moduleClass = styles['grw-custom-nav-tab'] ?? '';


type SwitchingButtonProps = {
  active?: boolean,
  children?: ReactNode,
  onClick?: () => void,
}
const SwitchingButton = memo((props: SwitchingButtonProps) => {
  const {
    active, children, onClick,
  } = props;

  const classNames = ['btn py-1 px-2 d-flex align-items-center justify-content-center'];
  if (active) {
    classNames.push('active');
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      onClick={onClick}
    >
      {children}
    </button>
  );
});


type CustomNavTabProps = {
  showPreview: boolean,
  onNavSelected?: (showPreview: boolean) => void,
};

export const CustomNavTab = (props: CustomNavTabProps): JSX.Element => {

  const { t } = useTranslation();

  const {
    showPreview, onNavSelected,
  } = props;

  return (
    <div
      className={`btn-group ${moduleClass}`}
      role="group"
    >
      <SwitchingButton
        active={!showPreview}
        onClick={() => onNavSelected?.(false)}
      >
        <span className="material-symbols-outlined me-1">edit_square</span>{t('Write')}
      </SwitchingButton>
      <SwitchingButton
        active={showPreview}
        onClick={() => onNavSelected?.(true)}
      >
        <span className="material-symbols-outlined me-0">play_arrow</span>{t('Preview')}
      </SwitchingButton>
    </div>
  );

};
