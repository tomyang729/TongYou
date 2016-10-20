var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    userid: ObjectId,
    username: String,
    age: {type: Number, default: undefined},
    gender:
    {
        type: String,
        enum: ['male', 'female']
    },
    email: String, // TODO: email validation
    password: String,
    phone: Number, // TODO: phone # validation
    language: [],
    payment:
    {
        card_num: String,
        bank: String,
        card_type:
        {
            type: String,
            enum: ['Visa', 'MasterCard', 'Debit Card', 'American Express', 'Capital One']
        }
    },
    profiles:[
        {
            guidename: String,
            guideid: ObjectId,
            location: String,
            start_date: Date,
            end_date: Date,
            state:
            {
                type: String,
                enum: ['Request Sent', 'Travelling', 'Done']
            },
            price: Number
        }
    ]
});

// check authen. against db
UserSchema.statics.authenticate = function (username, password, callback) {
    User.findOne({$or: [{username: username}, {email: username}]})
        .exec(function (err, user) {
            if (err) return callback(err);
            if (!user) {
                var err = new Error('user not found!');
                err.status = 401;
                return callback(err);
            } else {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result) {
                        callback(null, user); // use null to replace err
                    } else {
                        callback();
                    }
                });
            }

        });
};

// hash password before saving to db
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hashcode){ //param1=> plain password  param2=>how complex the hash func should be  param3=>callback
        if(err) {
            return next(err);
        } else {
            user.password = hashcode;
            next();
        }
    });
}, // hash payment card number before saving to db
    function (next) {
    console.log("haha");
    var user = this;
    bcrypt.hash(user.payment.card_num, 12, function(err, hashcode){
        if(err) {
            return next(err);
        } else {
            user.payment.card_num = hashcode;
            next();
        }
    });
});

var User = mongoose.model('User', UserSchema, 'user');
module.exports = User;