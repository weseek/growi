import { Container } from 'unstated';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */

export default class CustomNavbarContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      activeTab: '',
      // Prevent unnecessary rendering
      activeComponents: new Set(['']),
    };

    this.switchActiveTab = this.switchActiveTab.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'CustomNavbarContainer';
  }

  switchActiveTab(activeTab) {
    this.setState({
      activeTab, activeComponents: this.state.activeComponents.add(activeTab),
    });
  }

}
