const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); // require mapbox
const mapBoxToken = process.env.MAPBOX_TOKEN; // token for mapbox
const geoCoder = mbxGeocoding({accessToken: mapBoxToken}); // contains both forward and rev geocode


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
};

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new')
};

module.exports.createCampground = async (req,res,next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.geometry = (geoData.body.features[0].geometry);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground.images)
    req.flash('success', 'Success on creating a campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
};

module.exports.renderEdit = async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
};

module.exports.updateCampground = async (req,res) => {
    const {id} = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
        console.log(campground)
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground.')
    res.redirect('/campgrounds')
};