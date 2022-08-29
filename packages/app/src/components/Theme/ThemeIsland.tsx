import Image from 'next/image';

import { Themes } from '~/stores/use-next-themes';

import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeIsland.module.scss';

export const getBackgroundImageSrc = (colorScheme: Themes): string => {
  switch (colorScheme) {
    default:
      return '/images/themes/island/island.png';
  }
};

type Props = {
  children: JSX.Element,
  colorScheme?: Themes,
}

const ThemeIsland = ({ children, colorScheme }: Props): JSX.Element => {
  const bgImageNode = (
    <>
      {colorScheme != null && (
        <Image alt='background image' src={getBackgroundImageSrc(colorScheme)} layout='fill' quality="100" />
      )}
    </>
  );
  return <ThemeInjector className="theme-island" bgImageNode={bgImageNode}>{children}</ThemeInjector>;
};

export default ThemeIsland;
