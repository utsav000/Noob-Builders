const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];



const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '647f4b79432c654cae991369',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Commodi dolores porro quam? Assumenda temporibus magni exercitationem optio. Saepe tempore ab similique culpa nobis reprehenderit non, vero omnis beatae consectetur aut!',
            price: price,
            geometry: { type: "Point", 
                       coordinates: [cities[random1000].longitude, cities[random1000].latitude]
                     },
            images: [
                {
                    url: 'https://res.cloudinary.com/du3sqpnxv/image/upload/v1686225295/YelpCamp/eed4erjxytn3oj7kcwkb.jpg',
                    filename: 'YelpCamp/eed4erjxytn3oj7kcwkb',
                },
                {
                    url: 'https://res.cloudinary.com/du3sqpnxv/image/upload/v1686225296/YelpCamp/qesigjje1h0egdd59ggx.jpg',
                    filename: 'YelpCamp/qesigjje1h0egdd59ggx',
                }
            ]
        })
        await camp.save();
    }


}

seedDB().then(() => {
    mongoose.connection.close();
});
