import { Container } from 'unstated';

/**
 * Service container related to Nologin (installer, login)
 * @extends {Container} unstated Container
 */
export default class NoLoginContainer extends Container {

  constructor() {
    super();

    const body = document.querySelector('body');
    this.csrfToken = body.dataset.csrftoken;
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'NoLoginContainer';
  }

}
