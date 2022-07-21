import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeAntarctic.module.scss';

const ThemeAntarctic = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeAntarctic;
