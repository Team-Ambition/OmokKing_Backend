const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors())
app.use(express.json());

//Port Setting
const PORT = process.env.PORT;

//API Test
// app.get('/', (req, res) => {
// 	res.send('API Running');
// });

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <h1>OAuth</h1>
        <a href="/auth/google">LogIn</a>
        <a href="/auth/google/logout">LogOut</a>
    `);
});

//DataBase
const db = require('./models');

//Router
const GoogleAuthRouter = require('./routes/GoogleAuth');
app.use('/auth', GoogleAuthRouter);

//Swager
const { swaggerUi, specs } = require('./modules/Swagger');
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));

//Soket
const webSoket = require('./routes/Soket')
webSoket(server)

//Port
db.sequelize.sync().then(() => {
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});