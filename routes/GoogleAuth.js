const express = require('express');
const passport = require('passport');
const router = express.Router();
const session = require('express-session');

router.use(session({ secret: 'cats' }));
router.use(passport.initialize());
router.use(passport.session());
router.use(express.json());

require('./auth');

//로그인확인 미들웨어
const isLoggedIn = (req, res, next) => {
	if (req.user) {
		console.log(req.user)
		next();
	} else {
		res.sendStatus(401);
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
	passport.authenticate('google', {
		successRedirect: '/auth/protected',
		failureRedirect: '/auth/failure',
	})
);

router.get('/failure', (req, res) => {
	res.send('User Failure');
});

/**
 * @swagger
 *  /auth/protected:
 *    get:
 *      tags:
 *      - GoogleAuth
 *      description: 회원정보 가져오기
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: json형식으로 가져와짐
 */
router.get('/protected', isLoggedIn, (req, res) => {
	res.send(req.user);
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
			console.log('로그아웃됨.');
			res.redirect('/');
		}
	});
});

module.exports = router;