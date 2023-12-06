const express = require('express');
const router = express.Router({mergeParams: true}); // remember to use mergeParams so that the parameters or id would connect and not set it into a different stray 

// middleware
const {validateReview, isLoggedIn, verifyReviewAuthor} = require('../utilities/middleware');

// models
const Campground = require('../models/campground');
const Review = require('../models/review');

// controller 
const reviews = require('../controllers/reviews')

// utilities
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/ExpressError');
const review = require('../models/review');

// this route for submitting: Create and Update
router.post('/',isLoggedIn, validateReview, catchAsync (reviews.createReview))

// for deleting reviews: Delete
router.delete('/:reviewId',isLoggedIn, verifyReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;