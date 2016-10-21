var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var GuideSchema = new Schema({
    guideid: ObjectId,
    age: Number,
    avatar: String, // img url
    gender:
    {
        type: String,
        enum: ['male', 'female']
    },
    firstname: String,
    lastname: String,
    phone: Number, // TODO: phone # validation
    email: String,
    language: [],
    selfintro: String,
    //commentid: ObjectId,
    address:
    {
        street: String,
        city: String,
        state: String,
        country: String,
        postcode: String // TODO: validation
    },
    rating:
    {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    },
    routes:[],
    services:
    {
        plane: Boolean,
        car: Boolean,
        bed: Boolean,
        cutlery: Boolean,
        camera: Boolean
    }
});

module.exports = mongoose.model('Guide', GuideSchema, 'guide');