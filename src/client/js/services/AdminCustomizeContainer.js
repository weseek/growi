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
      themeType: appContainer.config.themeType,
    };

    this.switchLayoutType = this.switchLayoutType.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminCustomizeContainer';
  }

  /**
   * Switch layoutType
   */
  switchLayoutType(lauoutName) {
    this.setState({ layoutType: lauoutName });
  }

  /**
   * Switch themeType
   */
  switchThemeType(themeName) {
    // can't choose theme when kibela
    if (this.state.layoutType === 'kibela') {
      return;
    }
    this.setState({ themeType: themeName });
  }

  updateCustomizeLayout() {
    // TODO GW-479 post api
  }

}
