const socketIo = require('socket.io');

/**
 * Serve socket.io for server-to-client messaging
 */
class SocketIoService {

  constructor(configManager) {
    this.configManager = configManager;

    this.connectionsCount = 0;
    this.connectionsCountForAdmin = 0;
    this.connectionsCountForGuest = 0;
  }

  get isInitialized() {
    return (this.io != null);
  }

  attachServer(server) {
    this.io = socketIo(server, {
      transports: ['websocket'],
    });

    this.io.use(this.checkConnectionLimits.bind(this));

    // create namespace for admin
    this.adminNamespace = this.io.of('/admin');
  }

  getDefaultSocket() {
    if (this.io == null) {
      throw new Error('Http server has not attached yet.');
    }
    return this.io.sockets;
  }

  getAdminSocket() {
    if (this.io == null) {
      throw new Error('Http server has not attached yet.');
    }

    return this.adminNamespace;
  }

  async getClients(namespace) {
    return new Promise((resolve, reject) => {
      namespace.clients((error, clients) => {
        if (error) {
          reject(error);
        }
        resolve(clients);
      });
    });
  }

  /**
   * @see https://socket.io/docs/server-api/#socket-client
   */
  async checkConnectionLimits(socket, next) {

    const clients = await this.getClients(this.getDefaultSocket());
    const adminClients = await this.getClients(this.getAdminSocket());

    console.log('default', clients.length);
    console.log('admin', adminClients.length);

    if (socket.request.headers.cookie) {
      console.log('cookie exists');
      next();
    }
    // next(new Error('Authentication error'));
  }

}

module.exports = SocketIoService;
