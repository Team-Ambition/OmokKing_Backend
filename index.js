const express = require('express');
const app = express();
const ws = require('ws');
const HTTPServer = require('http');

const Port = 3001;

//API Test
app.get('/', (req, res) => {
	res.send('API Running');
});

//Start
app.listen(Port, () => {
	console.log(`API Running on Port ${Port}`);
});

//Soket
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 6974 });

wss.on('connection', (ws, req) => {
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
	console.log(ip + '접속되었습니다.');

	ws.on('message', (message) => {
		console.log(ip + '로 부터 받은 메시지 : ' + message);
		ws.send('메세지:' + message);
	});

	ws.on('error', (error) => {
		console.log(ip + '연결 오류 CODE : ' + error);
	});

	ws.on('close', () => {
		console.log(ip + '접속 종료');
	});
});
