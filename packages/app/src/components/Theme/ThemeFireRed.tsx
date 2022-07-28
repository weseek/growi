import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeFireRed.module.scss';

const ThemeFireRed = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeFireRed;
