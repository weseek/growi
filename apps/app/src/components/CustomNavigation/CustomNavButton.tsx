import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { memo } from 'react';

import { useTranslation } from 'next-i18next';

import styles from './CustomNavButton.module.scss';

const moduleClass = styles['grw-custom-nav-tab'] ?? '';


type SwitchingButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    active?: boolean,
}

const SwitchingButton = memo((props: SwitchingButtonProps) => {
  const {
    active, className, children, onClick, ...rest
  } = props;

  return (
    <button
      type="button"
      className={`btn btn-sm py-1 d-flex align-items-center justify-content-center
        ${className}
        ${active ? 'active' : ''}
      `}
      onClick={onClick}
      {...rest}
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
        className="px-2"
        onClick={() => onNavSelected?.(false)}
      >
        <span className="material-symbols-outlined me-1">edit_square</span>{t('Write')}
      </SwitchingButton>
      <SwitchingButton
        active={showPreview}
        className="ps-2 pe-3"
        onClick={() => onNavSelected?.(true)}
      >
        <span className="material-symbols-outlined me-0">play_arrow</span>{t('Preview')}
      </SwitchingButton>
    </div>
  );

};
