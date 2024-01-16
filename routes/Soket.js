const SocketIO = require('socket.io');

module.exports = (server) => {
  const io = SocketIO(server, { path: '/socket.io' });

  io.on('connection', (socket) => {
    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('클라이언트 접속', ip, socket.id,);

    //연결 종료 시
    socket.on('disconnect', () => {
      console.log('클라이언트 종료', ip, socket.id);
      clearInterval(socket.interval);
    });

    //에러 시
    socket.on('error', (error) => {
      console.error(error);
    });

    socket.on('reply', (data) => {
      console.log(data);
    });

    socket.on('news', (message) => {
      console.log('수신한 메시지:', message);
      socket.emit('news', "전송된 메시지 " + message);
    });

    socket.on('getRooms', () => {
      // 다른 네임스페이스의 객체에도 접근할 수 있다.
      socket.emit('rooms', io.sockets.adapter.rooms);
    });
  });


  const nsp = io.of('/my-namespace');

  nsp.on('connection', (socket) => {
    console.log('someone connected');
  });

  nsp.emit('hi', 'everyone!');
};