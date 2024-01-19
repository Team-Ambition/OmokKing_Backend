const SocketIO = require('socket.io');

module.exports = (server) => {
  const io = SocketIO(server, { path: '/socket.io' });

  io.on('connection', (socket) => {
    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('클라이언트 접속', ip, socket.id,);

    // 연결 종료 시
    socket.on('disconnect', () => {
      console.log('클라이언트 종료', ip, socket.id);
      clearInterval(socket.interval);
    });

    //에러 시
    socket.on('error', (error) => {
      console.error(error);
    });

    //이벤트 처리
    socket.onAny((event) => {
      // console.log(`Socket event : ${event}`);
    });

    const roomInfo = {}

    //방 만들기
    socket.on("room_new", (name) => {
      console.log(`Socket ${socket.id} is creating room ${name}.`);

      //Socket은 ID와 같은 Room을 Default로 갖고 있음
      if (socket.rooms.size > 1) {
        console.log(`socket ${socket.id} is already in room.`);
        console.log(socket.rooms);
        socket.emit("error", "이미 다른 방에 참가중입니다.");
        return;
      }

      //동일한 방이 존재할 경우
      // if (!checkDuplicateName(name)) {
      //   console.log(`Room name ${name} already exists.`);
      //   socket.emit("error", "동일한 방이 이미 존재합니다.");
      //   return;
      // }

      roomInfo.roomName = name
      roomInfo.blackPlayer = socket.id
      io.to(name).emit('join', socket.id + " 님이 방에 입장하였습니다.")
      socket.join(name);
      // console.log(roomInfo)
    })

    socket.on('join', (message) => {
      console.log('Join')
      const room = message

      roomInfo.whitePlayer = socket.id
      roomInfo.Omok = []
      socket.join(room);
      io.to(room).emit('join', socket.id + " 님이 방에 입장하였습니다.")

      console.log(roomInfo)
    })

    socket.on('message', (data) => {
      io.to(data.roomName).emit('message', data)
    })
  })
};