const socketIo = require('socket.io');
const expressSession = require('express-session');
const passport = require('passport');
const socketioSession = require('@kobalab/socket.io-session');

/**
 * Serve socket.io for server-to-client messaging
 */
class SocketIoService {

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;

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

    // setup passport session
    const sessionMiddleware = socketioSession(expressSession(this.crowi.sessionConfig), passport);
    this.io.use(sessionMiddleware.express_session);
    this.io.use(sessionMiddleware.passport_initialize);
    this.io.use(sessionMiddleware.passport_session);

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
    console.log('user', socket.request.user);

    next();
    // next(new Error('Authentication error'));
  }

}

module.exports = SocketIoService;
