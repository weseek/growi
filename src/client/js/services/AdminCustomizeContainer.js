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
      currentTheme: appContainer.config.themeType,
      currentLayout: appContainer.config.layoutType,
      currentBehavior: appContainer.config.behaviorType,
    };

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
    this.setState({ currentLayout: lauoutName });
  }

  /**
   * Switch themeType
   */
  switchThemeType(themeName) {
    // can't choose theme when kibela
    if (this.state.currentLayout === 'kibela') {
      return;
    }
    this.setState({ currentTheme: themeName });
  }

  /**
   * Switch behaviorType
   */
  switchBehaviorType(behaviorName) {
    this.setState({ currentBehavior: behaviorName });
  }

  /**
   * Update layout
   * @memberOf AdminCustomizeContainer
   * @return {Array} Appearance
   */
  async updateCustomizeLayoutAndTheme() {
    const response = await this.appContainer.apiv3.put('/customize-setting/layoutTheme', {
      layoutType: this.state.currentLayout,
      themeType: this.state.currentTheme,
    });
    const { customizedParams } = response.data;
    return customizedParams;
  }

  /**
   * Update behavior
   * @memberOf AdminCustomizeContainer
   * @return {string} Behavior
   */
  async updateCustomizeBehavior() {
    // TODO GW-497 create apiV3
  }

  /**
   * Update function
   * @memberOf AdminCustomizeContainer
   * @return {string} Functions
   */
  async updateCustomizeFunction() {
    // TODO GW-506 create apiV3
  }

}
