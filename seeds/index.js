// Dependencies
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const {descriptions} = require('./descriptions')
const Campground = require('../models/campground');
mongoose.set('strictQuery', false);

// line of code for mongoose
main().catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (e) {
        console.log('Error found: ', e)
    }
}

// logic to check if there is an error 
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database Connected")
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i <= 300; i++) {
        const random1000 = Math.floor(Math.random()* 1000);
        const random150 = Math.floor(Math.random()* 150);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            // YOUR USER ID
            author: '63ff7d90d1a69621a1da21d4',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: `${descriptions[random150]}`,
            price,
            geometry: {
                    type: "Point",
                    coordinates: [
                        cities[random1000].longitude, 
                        cities[random1000].latitude
                    ]
                },
            images: [
                {
                  url: 'https://res.cloudinary.com/dyj3kyaxl/image/upload/v1677690733/Trailtent/ohiqk3t6dhlq6ajeaeiu.jpg',
                  filename: 'Trailtent/ohiqk3t6dhlq6ajeaeiu',
                },
                {
                  url: 'https://res.cloudinary.com/dyj3kyaxl/image/upload/v1677690734/Trailtent/rsear5fx1jwrwunhggct.jpg',
                  filename: 'Trailtent/rsear5fx1jwrwunhggct',
                }
              ],
            
            
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});