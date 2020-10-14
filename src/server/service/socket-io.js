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

    // create namespace for admin
    this.adminNamespace = this.io.of('/admin');

    // setup middlewares
    // !!CAUTION!! -- ORDER IS IMPORTANT
    this.setupSessionMiddleware();
    this.setupLoginRequiredMiddleware();
    this.setupAdminRequiredMiddleware();
    this.setupCheckConnectionLimitsMiddleware();
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

  /**
   * use passport session
   * @see https://qiita.com/kobalab/items/083e507fb01159fe9774
   */
  setupSessionMiddleware() {
    const sessionMiddleware = socketioSession(expressSession(this.crowi.sessionConfig), passport);
    this.io.use(sessionMiddleware.express_session);
    this.io.use(sessionMiddleware.passport_initialize);
    this.io.use(sessionMiddleware.passport_session);
  }

  /**
   * use loginRequired middleware
   */
  setupLoginRequiredMiddleware() {
    const loginRequired = require('../middlewares/login-required')(this.crowi, true, (req, res) => {
      throw new Error('Login is required to connect.');
    });

    // convert Connect/Express middleware to Socket.io middleware
    this.io.use((socket, next) => {
      loginRequired(socket.request, {}, next);
    });
  }

  /**
   * use adminRequired middleware
   */
  setupAdminRequiredMiddleware() {
    const adminRequired = require('../middlewares/admin-required')(this.crowi, (req, res) => {
      throw new Error('Admin priviledge is required to connect.');
    });

    // convert Connect/Express middleware to Socket.io middleware
    this.getAdminSocket().use((socket, next) => {
      adminRequired(socket.request, {}, next);
    });
  }

  /**
   * use checkConnectionLimits middleware
   */
  setupCheckConnectionLimitsMiddleware() {
    this.io.use(this.checkConnectionLimits.bind(this));
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
