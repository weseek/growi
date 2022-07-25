import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeWood.module.scss';

const ThemeWood = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeWood;
