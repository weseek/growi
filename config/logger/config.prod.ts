import { UniversalBunyanConfig } from 'universal-bunyan';

const config: UniversalBunyanConfig = {
  default: 'info',

  'growi:routes:login-passport': 'debug',
  'growi:service:PassportService': 'debug',
};

export default config;
