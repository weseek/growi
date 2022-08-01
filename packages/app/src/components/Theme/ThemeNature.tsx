import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeNature.module.scss';

const ThemeNature = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeNature;
