const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// use db.campgrounds.find() in `mongo` terminal
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

// reset DB every time (delete everything, and then replace it with some random stuff)
// purpose: check whether our page works fine
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '60b0e3a95d29fb0f7a3af027',  // tim._id
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // get a diff image everytime, ref https://source.unsplash.com/
            // image: 'https://source.unsplash.com/collection/483251/800x450',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            price,
            geometry: {
                "type" : "Point", 
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dgn9e6s5a/image/upload/v1622812149/YelpCamp/htqnxksr12zfqfon71qx.jpg',
                  filename: 'YelpCamp/htqnxksr12zfqfon71qx'
                },
                {
                  url: 'https://res.cloudinary.com/dgn9e6s5a/image/upload/v1622812157/YelpCamp/qwqbdgfkrla1zhlmbsn8.jpg',
                  filename: 'YelpCamp/qwqbdgfkrla1zhlmbsn8'
                }
            ]
        })
        await camp.save();
    }
}

// seedDB: a async function, returns a promise
seedDB().then(() => {
    mongoose.connection.close();
})