import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeJadeGreen.module.scss';

const ThemeJadeGreen = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className="theme-jade-green">{children}</ThemeInjector>;
};
export default ThemeJadeGreen;
