import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeHufflepuff.module.scss';

const ThemeHufflepuff = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeHufflepuff;
