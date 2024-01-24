const express = require('express');
const passport = require('passport');
const router = express.Router();
const session = require('express-session');
const { Users } = require('../models');
const { default: axios } = require('axios');
const { sign } = require('jsonwebtoken')
const { jwtDecode } = require("jwt-decode")
const url = require('url')

router.use(session({ secret: process.env.SESSION_SECRET, name: 'SessionToken', secure: false }));
router.use(passport.initialize());
router.use(passport.session());
router.use(express.json());

require('./auth');

//로그인확인 미들웨어
const isLoggedIn = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.json({ message: "로그인 상태가 아닙니다. " })
	}
};

/**
 * @swagger
 *  /auth/google:
 *    get:
 *      tags:
 *      - GoogleAuth
 *      description: 구글 로그인
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 자동으로 리다이렉션됨
 */
router.get(
	'/google',
	passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	function (req, res) {
		const token = sign({ userId: req.user.dataValues.googleId }, process.env.JWT_SECRET);
		res.redirect(`http://localhost:3001/?accessToken=${token}`)
	}
);

router.get('/failure', (req, res) => {
	return res.json({ Status: "401", Message: "로그인 도중 알수없는 에러가 발생하였습니다. 다시 시도해주세요!" })
});

/**
 * @swagger
 *  /auth/userInfo:
 *    get:
 *      tags:
 *      - GoogleAuth
 *      description: 유저 정보 가져오기
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: json형식으로 가져와짐
 *       401:
 *        description: Unauthorized
 */
router.get('/userInfo', async (req, res) => {
	const accessToken = req.cookies('accessToken')

	if (!accessToken) return res.json({ error: '로그인 상태가 아닙니다.' });
	try {
		const validToken = jwtDecode(accessToken);
		const user = await Users.findOne({ where: { googleId: validToken.userId } });
		res.json({ name: user.name, profileImg: user.profileImg })
	} catch (err) {
		return res.json({ error: err });
	}
});

/**
 * @swagger
 *  /auth/google/logout:
 *    get:
 *      tags:
 *      - GoogleAuth
 *      description: 로그아웃
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 성공적으로 로그아웃이 됨
 */
router.get('/google/logout', (req, res, next) => {
	req.logOut((err) => {
		if (err) {
			return next(err);
		} else {
			req.session.destroy(function () {
				req.session;
			});
			res.redirect('http://localhost:3001/')
		}
	});
});

module.exports = router;