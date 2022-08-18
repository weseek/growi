import { Themes } from '~/stores/use-next-themes';

import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeHufflepuff.module.scss';

export const getBackgroundImageSrc = (colorScheme: Themes): string => {
  switch (colorScheme) {
    case Themes.light:
      return '/images/themes/hufflepuff/badger-light3.png';
    case Themes.dark:
      return '/images/themes/hufflepuff/badger-dark.jpg';
    default:
      return '/images/themes/hufflepuff/badger-light3.png';
  }
};

const ThemeHufflepuff = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className={styles.theme}>{children}</ThemeInjector>;
};
export default ThemeHufflepuff;
