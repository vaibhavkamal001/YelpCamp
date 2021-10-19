const Campground = require('../model/campground')
const {cloudinary} = require('../cloudinary')
const mbxGeocoding =require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoding = mbxGeocoding({accessToken:mapBoxToken})

module.exports.Index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.NewForm = (req, res) => {
    res.render('campgrounds/new')
} 

module.exports.Create = async (req, res, next) => {
    const geoData = await geocoding.forwardGeocode({
        query: req.body.campground.location,
        limit : 1
    }).send()
    const camp = new Campground(req.body.campground)
    camp.image = req.files.map(f=>({
        url:f.path,
        filename:f.filename
    }));
    camp.geometry = geoData.body.features[0].geometry;
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'You have Successfully Created new CampGround')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.Show = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Campground not Found')
        return res.redirect('/Campgrounds')
    }
    res.render('campgrounds/show', { camp })
}

module.exports.Edit = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        req.flash('error', 'Campground not Found')
        return res.redirect('/Campgrounds')
    }
    res.render('campgrounds/edit', { camp })
}

module.exports.Delete = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'You have Successfully Deleted the Campground')
    res.redirect('/campgrounds')
}

module.exports.Update = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true, new: true })
    const imgs = req.files.map(f=>({
        url:f.path,
        filename:f.filename
    }));
    camp.image.push(...imgs);
    if(req.body.deleteImage){
        for(let filename of req.body.deleteImage){
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({$pull:{image:{filename:{$in:req.body.deleteImage}}}})
    }
    await camp.save();
    req.flash('success', 'You have Successfully Updated CampGround')
    res.redirect(`/campgrounds/${camp._id}`)
}


