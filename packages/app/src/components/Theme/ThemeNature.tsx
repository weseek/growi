import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeNature.module.scss';

const ThemeNature = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className="theme-nature">{children}</ThemeInjector>;
};
export default ThemeNature;
