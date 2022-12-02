import { ThemeInjector } from './utils/ThemeInjector';

// import styles from './ThemeKibela.module.scss';

const ThemeKibela = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector className="theme-kibela">{children}</ThemeInjector>;
};
export default ThemeKibela;
