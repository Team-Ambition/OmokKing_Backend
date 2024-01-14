const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

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

//Port
db.sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
