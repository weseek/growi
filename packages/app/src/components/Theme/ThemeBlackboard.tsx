import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeBlackboard.module.scss';

const ThemeBlackboard = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeBlackboard;
