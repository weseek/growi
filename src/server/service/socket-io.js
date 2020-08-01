const socketIo = require('socket.io');

class SocketIoService {

  constructor(server) {
    this.io = socketIo(server, {
      transports: ['websocket'],
    });

    // create namespace for admin
    this.adminNamespace = this.io.of('/admin');
  }

  getDefaultSocket() {
    return this.io.sockets;
  }

  getAdminSocket() {
    return this.adminNamespace;
  }

}

module.exports = SocketIoService;
