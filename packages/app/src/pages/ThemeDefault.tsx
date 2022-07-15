
import styles from './theme-default.module.scss';
import { ThemeInjector } from './ThemeInjector';

const ThemeDefault = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <ThemeInjector themeStyles={styles}>{children}</ThemeInjector>;
}
export default ThemeDefault;
