import SocketIoContainer from './SocketIoContainer';
import { toastError } from '../util/apiNotification';

/**
 * A subclass of SocketIoContainer for /admin namespace
 */
export default class AdminSocketIoContainer extends SocketIoContainer {

  constructor(appContainer) {
    super(appContainer, '/admin');

    // show toastr
    this.socket.on('error', (error) => {
      toastError(new Error(error));
    });
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminSocketIoContainer';
  }

}
