import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeDefault.module.scss';

const ThemeDefault = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className="theme-default">{children}</ThemeInjector>;
};
export default ThemeDefault;
