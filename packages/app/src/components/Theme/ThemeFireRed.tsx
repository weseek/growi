import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeFireRed.module.scss';

const ThemeFireRed = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className="theme-fire-red">{children}</ThemeInjector>;
};
export default ThemeFireRed;
