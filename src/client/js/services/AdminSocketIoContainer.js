import SocketIoContainer from './SocketIoContainer';

export default class AdminSocketIoContainer extends SocketIoContainer {

  constructor(appContainer) {
    super(appContainer, '/admin');
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminSocketIoContainer';
  }

}
