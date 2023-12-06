// middlewares
const {campgroundSchema, reviewSchema} = require('../schemas.js');
// utilities
const catchAsync = require('./catchAsync'); // catching errors
const ExpressError = require('./ExpressError'); // error

const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login')
    }
    next();
}

// this code is for checking campground validations
module.exports.validateCampGround = (req, res, next) => {
    // this line of code is the JOI which allows errors from objects
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// middleware for authorization if user is allowed to chance camp
module.exports.verifyAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author._id.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// middleware for authorization if user is allowed to chance camp
module.exports.verifyReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author._id.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// this code is for checking reviews validations
module.exports.validateReview = (req, res, next) => {
    // this line of code is the JOI which allows errors from objects
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        console.log(error)
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// middleware for changing & limiting image size and images
// const multer = require('multer');
// const { storage } = require('../cloudinary');
// const upload = multer({ storage, limits: 500000 }).array('image', 2);
// module.exports.uploadFile = (req, res, next) => {
//    const uploadProcess = upload.array('image');

//    uploadProcess(req, res, err => {
//       if (err instanceof multer.MulterError) {
//          return next(new Error(err, 500));
//       } else if (err) {
//          return next(new Error(err, 500));
//       }
//       next();
//    });
// };
 