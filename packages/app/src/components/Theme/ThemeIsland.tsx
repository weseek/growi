import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeIsland.module.scss';

const ThemeIsland = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeIsland;
