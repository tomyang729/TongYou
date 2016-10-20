var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
    content: String,
    creator: Number, // who post this comment, should be userid
    commentid: ObjectId
});

module.exports = mongoose.model('Comment', CommentSchema, 'comment');