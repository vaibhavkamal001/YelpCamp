if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')
const Joi = require('joi') 
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const MongoDBStore = require('connect-mongo');
const flash = require('connect-flash')
const passport = require('passport');
const localStategy = require('passport-local')
const User = require('./model/user')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize')
const dbUrl = process.env.DB_URL;
const secret = process.env.SECRET;

// mongodb conection

// dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
})

// routers
const campgroundsRoutes = require('./routers/campground');
const reviewsRoutes = require('./routers/review');
const usersRoutes = require('./routers/users')

// require the ejs 
app.engine('ejs',ejsMate);

// dynamic path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// session

const store = MongoDBStore.create({
    mongoUrl:dbUrl,
    secret,
    touchAfter:24*60*60
});

store.on('error',function(e){
    console.log("SESSION ERROR",e);
})

const sessionConfig = {
    store,
    secret,
    resave:false,
    saveUninitialized : true,
    cookie:{
        httpOnly:true,
        expires:Date.now() +1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))

// flash
app.use(flash())

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash middelware
app.use((req,res,next)=>{
    res.locals.CurrentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Middelwares
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

//routers
app.use('/',usersRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})




// helmet

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Reviews Sections

// Campground Sctions  

//error handling middelware

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message){
        err.message = "something went worng"
    }
    res.status(statusCode).render('error',{err});
})

// define port
app.listen(3000, () => {
    console.log('Serving on Port 3000')
})