import styles from './Separator.module.scss';

export const Separator = ({ className }: {className?: string}): React.ReactElement => (
  <span className={`separator ${className ?? ''} ${styles['grw-mx-02em']}`}>/</span>
);
