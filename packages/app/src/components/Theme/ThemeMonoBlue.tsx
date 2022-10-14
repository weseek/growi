import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeMonoBlue.module.scss';

const ThemeMonoBlue = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className="theme-mono-blue">{children}</ThemeInjector>;
};
export default ThemeMonoBlue;
