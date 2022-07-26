import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeSpring.module.scss';

const ThemeSpring = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeSpring;
