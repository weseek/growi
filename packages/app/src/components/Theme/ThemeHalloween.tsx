import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeHalloween.module.scss';

const ThemeHalloween = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeHalloween;
