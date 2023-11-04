const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');



router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/registeradmin')
    .get(users.renderRegisterAdmin)
    .post(catchAsync(users.registerAdmin));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.Login);


router.route('/loginadmin')
    .get(users.renderLoginAdmin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/loginadmin' }), users.LoginAdmin);

router.route('/login_choose')
    .get(users.renderLoginChoose);

router.route('/Register_choose')
    .get(users.renderRegisterChoose);

router.get('/logout', users.Logout);

module.exports = router;
