const SocketIO = require('socket.io');

module.exports = (server) => {
  const io = SocketIO(server, { path: '/socket.io' });
  io.on('connection', (socket) => {
    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('클라이언트 접속', ip, socket.id,);

    //* 연결 종료 시
    socket.on('disconnect', () => {
      console.log('클라이언트 종료', ip, socket.id);
      clearInterval(socket.interval);
    });

    //* 에러 시
    socket.on('error', (error) => {
      console.error(error);
    });

    //* 클라이언트로부터 메시지 수신
    socket.on('reply', (data) => { // reply라는 이벤트로 송신오면 메세지가 data인수에 담김
      console.log(data);
    });

    //* 클라이언트로 메세지 송신
    socket.emit('news', 'Hello Socket.IO'); // news라는 이벤트로 문자열을 포함하여 송신
  });

  
  const nsp = io.of('/my-namespace');

  nsp.on('connection', socket => {
    console.log('someone connected');
  });

  nsp.emit('hi', 'everyone!');
};