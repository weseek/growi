import { Container } from 'unstated';

/**
 * Service container for login form (LoginForm.jsx)
 * @extends {Container} unstated Container
 */
export default class LoginForm extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'LoginContainer';
  }

}
