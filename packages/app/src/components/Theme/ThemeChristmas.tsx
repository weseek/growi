import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeChristmas.module.scss';

const ThemeChristmas = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeChristmas;
