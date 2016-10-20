var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var GuideSchema = new Schema({
    guideid: ObjectId,
    firstname: String,
    lastname: String,
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
    selfintro: String,
    commentid: ObjectId,
    services: [{type: String, enum: ["airport pickup", "airport drop-off", "trip planning"]}]
});

module.exports = mongoose.model('Guide', GuideSchema, 'guide');