const express = require('express');
const router = express.Router();
const passport = require('passport')
const User = require('../model/user')
const catchAsync = require('../utils/catchAsync')
const {isLogin} = require('../middelware')
const users = require('../collectors/User')


router.route('/register')
    .get(users.registerUser)
    .post(catchAsync(users.createRegister))

router.route('/login')
    .get(users.loginForm)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}) ,users.loginUser)

router.get('/logout',users.logoutUser)

module.exports = router