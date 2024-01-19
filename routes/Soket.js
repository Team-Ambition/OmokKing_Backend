const SocketIO = require('socket.io');

module.exports = (server) => {
  const io = SocketIO(server, { path: '/socket.io' });

  const roomList = []

  const roomInfo = {
    roomName: "",
    P1_SocketId: "",
    P1_Name: "",
    P1_IMG: "",
    P2_SocketId: "",
    P2_Name: "",
    P2_IMG: "",
    Full: false,
    Omok: []
  }

  let 접속자수 = 0

  io.on('connection', (socket) => {
    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('클라이언트 접속', ip, socket.id,);
    접속자수 += 1

    // 연결 종료 시
    socket.on('disconnect', () => {
      console.log('클라이언트 종료', ip, socket.id);
      접속자수 -= 1
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

    //방 만들기
    socket.on("room_new", (data) => {
      const { roomName, P1_Name, P1_IMG } = data
      roomInfo.roomName = roomName
      roomInfo.P1_SocketId = socket.id
      roomInfo.P1_Name = P1_Name
      roomInfo.P1_IMG = P1_IMG

      const roomIndex = roomList.findIndex(obj => obj.roomName == roomName)
      if (roomIndex == -1) {
        roomList.push(roomInfo)
      } else {
        console.log(`Room name ${roomIndex} already exists.`);
        socket.emit("error", "동일한 방이 이미 존재합니다.");
      }

      //두번 참가 및 생성이 안되도록
      if (socket.rooms.size > 1) {
        console.log(`socket ${socket.id} is already in room.`);
        console.log(socket.rooms);
        socket.emit("error", "이미 다른 방에 참가중입니다.");
        return;
      }

      console.log(`Socket ${socket.id} is creating room ${roomName}.`);

      socket.join(roomName);
      socket.broadcast.to(roomName).emit('Main', P1_Name + " 님이 방에 입장하였습니다.")
      io.to(roomName).emit('Main', roomInfo)

      // console.log(roomInfo)
      console.log(roomList)
    })

    //방 들어가기
    socket.on('join', (data) => {
      const { roomName, P2_Name, P2_IMG } = data
      roomInfo.P2_SocketId = socket.id
      roomInfo.P2_Name = P2_Name
      roomInfo.P2_IMG = P2_IMG
      roomInfo.Omok = []
      
      const roomIndex = roomList.findIndex(obj => obj.roomName == roomName)
      roomList[roomIndex] = (roomInfo)

      //두번 참가 및 생성이 안되도록
      // if (socket.rooms.size > 1) {
      //   console.log(`socket ${socket.id} is already in room.`);
      //   console.log(socket.rooms);
      //   socket.emit("error", "이미 다른 방에 참가중입니다.");
      //   return;
      // }

      //방이 가득찼는 지 검사
      if (roomList[roomIndex].Full == true) {
        console.log(`This Room ${roomIndex} already Full`);
        socket.emit("error", "방이 가득찼습니다.");
        return;
      } else {
        socket.join(roomName);
      }
      roomInfo.Full = true
      socket.broadcast.to(roomName).emit('Main', P2_Name + " 님이 방에 입장하였습니다.")
      io.to(roomName).emit('Main', roomInfo)

      // console.log(roomInfo)
      console.log(roomList)
    })

    //방 나가기
    socket.on('leave', (data) => {
      const { roomName } = data
      socket.leave(roomName);
    })

    socket.on('message', (data) => {
      const { roomName, Omok } = data
      io.socket.in(roomName).emit('message', Omok)
    })
  })
};