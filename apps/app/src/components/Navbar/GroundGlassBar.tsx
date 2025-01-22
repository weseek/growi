import type { DetailedHTMLProps } from 'react';

import styles from './GroundGlassBar.module.scss';

const moduleClass = styles['ground-glass-bar'];

type Props = DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const GroundGlassBar = (props: Props): React.ReactElement => {
  const { className, children, ...rest } = props;

  return (
    <div className={`${moduleClass} ${className ?? ''}`} {...rest}>
      {children}
    </div>
  );
};
