import Image from 'next/image';

import { Themes } from '~/stores/use-next-themes';

import { ThemeInjector } from './utils/ThemeInjector';

import styles from './ThemeChristmas.module.scss';

export const getBackgroundImageSrc = (colorScheme: Themes): string => {
  switch (colorScheme) {
    default:
      return '/images/themes/christmas/christmas.jpg';
  }
};

type Props = {
  children: JSX.Element,
  colorScheme?: Themes,
}

const ThemeChristmas = ({ children, colorScheme }: Props): JSX.Element => {
  const element = (
    <>
      {colorScheme && (
        <div className={'grw-bg-image-wrapper'}>
          <Image className='grw-bg-image' alt='background image' src={getBackgroundImageSrc(colorScheme)} layout='fill' quality="100" />
        </div>
      )}
      {children}
    </>
  );
  return <ThemeInjector className={`${styles.theme}`}>{element}</ThemeInjector>;
};
export default ThemeChristmas;
