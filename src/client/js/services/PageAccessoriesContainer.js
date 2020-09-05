import { Container } from 'unstated';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */

export default class PageAccessoriesContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      isPageAccessoriesModalShown: false,
      activeTab: '',
      // Prevent unnecessary rendering
      activeComponents: new Set(['']),
    };
    this.openPageAccessoriesModal = this.openPageAccessoriesModal.bind(this);
    this.closePageAccessoriesModal = this.closePageAccessoriesModal.bind(this);
    this.switchActiveTab = this.switchActiveTab.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'PageAccessoriesContainer';
  }


  openPageAccessoriesModal(activeTab) {
    this.setState({
      isPageAccessoriesModalShown: true,
    });
    this.switchActiveTab(activeTab);
  }

  closePageAccessoriesModal() {
    this.setState({
      isPageAccessoriesModalShown: false,
    });
  }

  switchActiveTab(activeTab) {
    this.setState({
      activeTab, activeComponents: this.state.activeComponents.add(activeTab),
    });
    // ここに何かしらつける?
  }

}
