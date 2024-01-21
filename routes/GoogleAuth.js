const express = require('express');
const passport = require('passport');
const router = express.Router();
const session = require('express-session');

router.use(session({ secret: 'cats', name: 'SessionToken' }));
router.use(passport.initialize());
router.use(passport.session());
router.use(express.json());

require('./auth');

//로그인확인 미들웨어
const isLoggedIn = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.json("로그인 상태가 아닙니다.")
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
		successRedirect: 'http://localhost:3001',
		failureRedirect: '/',
	})
);

router.get('/failure', (req, res) => {
	return res.json({ Status: "401", Message: "로그인 도중 알수없는 에러가 발생하였습니다. 다시 시도해주세요!" })
});

/**
 * @swagger
 *  /auth/protected:
 *    get:
 *      tags:
 *      - GoogleAuth
 *      description: 로그인 상태 확인
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: json형식으로 가져와짐
 *       401:
 *        description: Unauthorized
 */
router.get('/protected', isLoggedIn, (req, res) => {
	const UserInfo = req.user.dataValues
	req.session.user = UserInfo
	if (req.user) {
		return res.json({ Status: "200", Message: { name: UserInfo.name, profileImg: UserInfo.profileImg } })
	} else {
		return res.json({ Status: "401", Message: "Unauthorized" })
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
			return res.json({ Status: "200", Message: "성공적으로 로그아웃되었습니다." })
		}
	});
});

module.exports = router;