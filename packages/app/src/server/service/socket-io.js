const socketIo = require('socket.io');
const expressSession = require('express-session');
const passport = require('passport');
const socketioSession = require('@kobalab/socket.io-session');

const logger = require('@alias/logger')('growi:service:socket-io');


/**
 * Serve socket.io for server-to-client messaging
 */
class SocketIoService {

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;

    this.guestClients = new Set();
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

    this.setupStoreGuestIdEventHandler();
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
    const loginRequired = require('../middlewares/login-required')(this.crowi, true, (req, res, next) => {
      next(new Error('Login is required to connect.'));
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
    const adminRequired = require('../middlewares/admin-required')(this.crowi, (req, res, next) => {
      next(new Error('Admin priviledge is required to connect.'));
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
    this.getAdminSocket().use(this.checkConnectionLimitsForAdmin.bind(this));
    this.getDefaultSocket().use(this.checkConnectionLimitsForGuest.bind(this));
    this.getDefaultSocket().use(this.checkConnectionLimits.bind(this));
  }

  setupStoreGuestIdEventHandler() {
    this.io.on('connection', (socket) => {
      if (socket.request.user == null) {
        this.guestClients.add(socket.id);

        socket.on('disconnect', () => {
          this.guestClients.delete(socket.id);
        });
      }
    });
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

  async checkConnectionLimitsForAdmin(socket, next) {
    const namespaceName = socket.nsp.name;

    if (namespaceName === '/admin') {
      const clients = await this.getClients(this.getAdminSocket());
      const clientsCount = clients.length;

      logger.debug('Current count of clients for \'/admin\':', clientsCount);

      const limit = this.configManager.getConfig('crowi', 's2cMessagingPubsub:connectionsLimitForAdmin');
      if (limit <= clientsCount) {
        const msg = `The connection was refused because the current count of clients for '/admin' is ${clientsCount} and exceeds the limit`;
        logger.warn(msg);
        next(new Error(msg));
        return;
      }
    }

    next();
  }

  async checkConnectionLimitsForGuest(socket, next) {

    if (socket.request.user == null) {
      const clientsCount = this.guestClients.size;

      logger.debug('Current count of clients for guests:', clientsCount);

      const limit = this.configManager.getConfig('crowi', 's2cMessagingPubsub:connectionsLimitForGuest');
      if (limit <= clientsCount) {
        const msg = `The connection was refused because the current count of clients for guests is ${clientsCount} and exceeds the limit`;
        logger.warn(msg);
        next(new Error(msg));
        return;
      }
    }

    next();
  }

  /**
   * @see https://socket.io/docs/server-api/#socket-client
   */
  async checkConnectionLimits(socket, next) {
    // exclude admin
    const namespaceName = socket.nsp.name;
    if (namespaceName === '/admin') {
      next();
    }

    const clients = await this.getClients(this.getDefaultSocket());
    const clientsCount = clients.length;

    logger.debug('Current count of clients for \'/\':', clientsCount);

    const limit = this.configManager.getConfig('crowi', 's2cMessagingPubsub:connectionsLimit');
    if (limit <= clientsCount) {
      const msg = `The connection was refused because the current count of clients for '/' is ${clientsCount} and exceeds the limit`;
      logger.warn(msg);
      next(new Error(msg));
      return;
    }

    next();
  }

}

module.exports = SocketIoService;
