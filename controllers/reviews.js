// models
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    campground.reviews.push(newReview);
    await campground.save();
    await newReview.save();
    req.flash('success', 'Review Submitted!')
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteReview =  async (req, res) => {
    const {id, reviewId} = req.params;
    const findCamp = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    console.log(findCamp);
    const deleteReview = await Review.findByIdAndDelete(reviewId);
    console.log(deleteReview);
    req.flash('success', 'Review deleted.')
    res.redirect(`/campgrounds/${id}`);
};