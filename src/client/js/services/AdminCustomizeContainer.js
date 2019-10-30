import { Container } from 'unstated';

/**
 * Service container for admin customize setting page (Customize.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminCustomizeContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      layoutType: appContainer.config.layoutType,
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminCustomizeContainer';
  }

}
