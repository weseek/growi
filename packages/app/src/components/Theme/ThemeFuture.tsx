import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeFuture.module.scss';

const ThemeFuture = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className="theme-future">{children}</ThemeInjector>;
};
export default ThemeFuture;
