import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeDefault.module.scss';

const ThemeDefault = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeDefault;
