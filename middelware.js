const {campgroundSchema} = require('./validate_schemas') 
const { reviewSchema } = require('./validate_schemas')
const ExpressError = require('./utils/ExpressError');
const Campground = require('./model/campground') 
const Review = require('./model/reviews');



module.exports.validate_review = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validate_campground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}
module.exports.isLogin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must login First')
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash('error','You are not Authorized');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {reviewId} = req.params;
    const rev = await Review.findById(reviewId);
    if(!rev.author.equals(req.user._id)){
        req.flash('error','You are not Authorized');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
