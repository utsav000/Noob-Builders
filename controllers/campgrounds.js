
const Campground = require('../models/campground');
const Complaint = require('../models/complaint');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');


module.exports.index = async (req, res) => {
    const complaints = await Complaint.find({});
    res.render('campgrounds/index', { complaints });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data, 400');
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    // console.log(campground);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Cannot find the Campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {

    // take id form current campground and match with logged in user
    const { id } = req.params;


    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);

    await campground.save();

    if (req.body.deleteImages) {

        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        await campground.updateOne({
            $pull: {
                images: { filename: { $in: req.body.deleteImages } }
            }
        })
        // console.log(campground);
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
    // res.send("done");
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do this');
        return res.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted');
    res.redirect('/campgrounds');
}
