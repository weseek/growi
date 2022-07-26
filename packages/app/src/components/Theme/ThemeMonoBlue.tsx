import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeMonoBlue.module.scss';

const ThemeMonoBlue = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeMonoBlue;
