import { Container } from 'unstated';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */

export default class PafeAccessoriesContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      isPageAccessoriesModalShown: false,
      activeTab: '',
      // Prevent unnecessary rendering
      activeComponents: new Set(['']),
    };

    // this.openPageCreateModal = this.openPageCreateModal.bind(this);
    // this.closePageCreateModal = this.closePageCreateModal.bind(this);
  }

}
