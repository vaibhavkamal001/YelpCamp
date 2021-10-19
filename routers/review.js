const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync')
const Review = require('../model/reviews');
const Campground = require('../model/campground')
const { validate_review, isLogin, isReviewAuthor } = require('../middelware')
const review = require('../collectors/reviews')

router.post('/', isLogin, validate_review, catchAsync(review.Create))

router.delete('/:reviewId', isLogin, isReviewAuthor,catchAsync(review.Delete))

module.exports = router;