const socketIo = require('socket.io');

class SocketIoService {

  constructor(server) {
    this.io = socketIo(server, {
      transports: ['websocket'],
    });
  }

  getIo() {
    return this.io;
  }

}

module.exports = SocketIoService;
