import Image from 'next/image';

import { Themes } from '~/stores/use-next-themes';

import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeSpring.module.scss';

export const getBackgroundImageSrc = (colorScheme: Themes): string => {
  switch (colorScheme) {
    default:
      return '/images/themes/spring/spring02.svg';
  }
};

type Props = {
  children: JSX.Element,
  colorScheme?: Themes,
}

const ThemeSpring = ({ children, colorScheme }: Props): JSX.Element => {
  const newChildren = (
    <>
      {colorScheme != null && (
        <div className='grw-bg-image-wrapper'>
          <Image className='grw-bg-image' alt='background-image' src={getBackgroundImageSrc(colorScheme)} layout='fill' quality="100" />
        </div>
      )}
      {children}
    </>
  );
  return <ThemeInjector className={styles.theme}>{newChildren}</ThemeInjector>;
};

export default ThemeSpring;
