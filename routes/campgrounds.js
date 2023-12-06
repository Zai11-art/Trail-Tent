const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');

// multer middleware for image uploads
const multer  = require('multer');
const {storage} = require('../cloudinary/index');
const upload = multer({ storage });


// controllers
const campgrounds = require('../controllers/campgrounds')

// middlewares
const {isLoggedIn, validateCampGround, verifyAuthor, imageCheck} = require('../utilities/middleware')
// models
const Campground = require('../models/campground');

// Refactored routes
// Index and Create routes
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'), validateCampGround, catchAsync(campgrounds.createCampground))
    // remember to check the docs for the upload.array as this is part of multer
    // .post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files);
    //     res.send('it worked')
    // })
// create a new campground: new
router.get('/new',isLoggedIn, (campgrounds.renderNewForm))

// Show, Update and Delete routes
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, verifyAuthor, upload.array('image'), validateCampGround, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, verifyAuthor, catchAsync(campgrounds.deleteCampground))

// editing the campground finding the id: Edit
router.get('/:id/edit', isLoggedIn, verifyAuthor, catchAsync(campgrounds.renderEdit))


// Original route formats
// show the home page: index
// router.get('/', catchAsync(campgrounds.index))

// // create a new campground: new
// router.get('/new',isLoggedIn, (campgrounds.renderNewForm))

// // add a new campground: create
// router.post('/', isLoggedIn, validateCampGround, catchAsync(campgrounds.createCampground))

// // show 
// router.get('/:id', catchAsync(campgrounds.showCampground))

// // editing the campground finding the id: Edit
// router.get('/:id/edit', isLoggedIn, verifyAuthor, catchAsync(campgrounds.renderEdit))

// // put edited data to the database: Update
// router.put('/:id',isLoggedIn, verifyAuthor, validateCampGround, catchAsync(campgrounds.updateCampground))

// deletion of the camp: Delete
// router.delete('/:id', isLoggedIn, verifyAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;