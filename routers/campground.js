const express = require('express');
const router = express.Router();
const Campground = require('../model/campground')
const catchAsync = require('../utils/catchAsync')
const { validate_campground, isLogin, isAuthor } = require('../middelware')
const campground = require('../collectors/campgrounds');
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campground.Index))
    .post(isLogin,upload.array('image'), validate_campground, catchAsync(campground.Create))

router.get('/new', isLogin, campground.NewForm)

router.route('/:id')
    .get(catchAsync(campground.Show))
    .delete(isLogin, isAuthor, catchAsync(campground.Delete))
    .put(isLogin, isAuthor, upload.array('image'), validate_campground, catchAsync(campground.Update))

router.get('/:id/edit', isLogin, isAuthor, catchAsync(campground.Edit))

module.exports = router;
