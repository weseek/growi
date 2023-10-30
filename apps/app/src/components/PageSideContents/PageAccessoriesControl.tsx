import { type ReactNode, memo } from 'react';

import CountBadge from '../Common/CountBadge';


import styles from './PageAccessoriesControl.module.scss';

const moduleClass = styles['btn-page-accessories'];


type Props = {
  className?: string,
  icon: ReactNode,
  label: ReactNode,
  count?: number,
  onClick?: () => void,
}

export const PageAccessoriesControl = memo((props: Props): JSX.Element => {
  const {
    icon, label, count,
    className,
    onClick,
  } = props;

  return (
    <button
      type="button"
      className={`btn btn-sm btn-outline-secondary ${moduleClass} ${className} rounded-pill`}
      onClick={onClick}
    >
      <span className="grw-icon d-flex">{icon}</span>
      <span className="grw-labels ms-1 d-none d-md-flex">
        {label}
        {/* Do not display CountBadge if '/trash/*': https://github.com/weseek/growi/pull/7600 */}
        { count != null
          ? <CountBadge count={count} offset={1} />
          : <div className="px-2"></div>}
      </span>
    </button>
  );
});
