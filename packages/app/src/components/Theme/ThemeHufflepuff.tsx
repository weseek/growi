import Image from 'next/image';

import { Themes } from '~/stores/use-next-themes';

import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeHufflepuff.module.scss';

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

type Props = {
  children: JSX.Element,
  colorScheme?: Themes,
}

const ThemeHufflepuff = ({ children, colorScheme }: Props): JSX.Element => {
  const bgImageNode = (
    <>
      {colorScheme != null && (
        <Image alt='background image' src={getBackgroundImageSrc(colorScheme)} layout='fill' quality="100" />
      )}
    </>
  );
  return <ThemeInjector className="theme-hufflepuff" bgImageNode={bgImageNode}>{children}</ThemeInjector>;
};

export default ThemeHufflepuff;
