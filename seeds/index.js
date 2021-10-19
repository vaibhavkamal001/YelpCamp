const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../model/campground') 

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random()*array.length)]; 

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i = 0; i<300; i++){
        const price = Math.floor(Math.random()*1000)+10;
        const random1000 = Math.floor(Math.random()*1000)
        const camp = new Campground({
            author: '61665bfe143cfc8feaa63c56',
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry : { 
                type : "Point",
                coordinates : [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ] 
            },
            title : `${sample(descriptors)} ${sample(places)}`,
            image : [{
                url:'https://res.cloudinary.com/ds62e0phf/image/upload/v1634275173/YelpCamp/nl3bn25bygjrl7qhg6uh.jpg',
                filename:'YelpCamp/nl3bn25bygjrl7qhg6uh'
            }],
            description : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Labore commodi distinctio, nihil adipisci repellat quae beatae quis quasi illum laboriosam iste eaque. Molestiae reiciendis necessitatibus vel molestias maxime eos cum!",
            price
        })
        await camp.save()
    }
     
    
} 



seedDB().then(()=>{
    mongoose.connection.close();
})