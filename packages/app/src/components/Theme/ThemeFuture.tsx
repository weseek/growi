import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeFuture.module.scss';

const ThemeFuture = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeFuture;
