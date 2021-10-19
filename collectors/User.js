const { model } = require('mongoose')
const User = require('../model/user')

module.exports.registerUser = (req, res) => {
    res.render('campgrounds/register')
}

module.exports.createRegister = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password);
        req.login(registeredUser,err=>{
            if(err) return next(err);
            req.flash('success','You are Successfully registered')
            res.redirect('/campgrounds')
        })        
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.loginForm = (req, res) => {
    res.render('campgrounds/login')
}

module.exports.loginUser =  (req, res) => {
    req.flash('success','You have Login');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

module.exports.logoutUser = async(req,res)=>{
    req.logOut();
    req.flash('success','You have LogOut');
    res.redirect('/campgrounds');
}