const Review = require('../model/reviews');
const Campground = require('../model/campground');

module.exports.Create = async (req, res) => {
    const { id } = req.params;
    const rev = await new Review(req.body.reviews);
    rev.author = req.user._id;
    const camp = await Campground.findById(id);
    camp.reviews.push(rev);
    await camp.save();
    await rev.save()
    res.redirect(`/campgrounds/${id}`);
}

module.exports.Delete = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}