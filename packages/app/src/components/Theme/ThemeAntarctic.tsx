import Image from 'next/image';

import { Themes } from '~/stores/use-next-themes';

import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeAntarctic.module.scss';

export const getBackgroundImageSrc = (colorScheme: Themes): string => {
  switch (colorScheme) {
    default:
      return '/images/themes/antarctic/bg.svg';
  }
};

type Props = {
  children: JSX.Element,
  colorScheme?: Themes,
}

const ThemeAntarctic = ({ children, colorScheme }: Props): JSX.Element => {
  const element = colorScheme == null
    ? children
    : (
      <>
        <div className={`grw-bg-image-wrapper ${styles['grw-bg-image-wrapper']}`}>
          <Image className='grw-bg-image' alt='background-image' src={getBackgroundImageSrc(colorScheme)} layout='fill' quality="100" />
        </div>
        {children}
      </>
    );

  return <ThemeInjector className={`hoge ${styles.theme}`}>{element}</ThemeInjector>;
};
export default ThemeAntarctic;
