var express = require('express');
var router = express.Router();
var path = require('path');

// import models
var User = require('../models/user.js');
var Guide = require('../models/guide');


// HOME PAGE
router.get('/', function (req, res) {
    //res.render('index', {title: 'Home Page', message: 'Welcome to TongYou!'});
    res.sendFile(path.join(__dirname, '../public/html', 'index.html'));
});

// SIGN UP
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.get('/signup', function (req, res) {
    res.render('signup', {title: 'Sign Up', message: 'Sign Up'});
});
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<
router.post('/signup', function (req, res, next) {
    // TODO: check if the user already exist
    if(req.body.username &&
        req.body.email &&
        req.body.password) {

        user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        user.save(function (err) {
            if(err) {
                return handleError(err);
            } else {
                req.session.userid = user._id;
                res.redirect('/profile');
                console.log("register successfully");
            }
        });

    } else {
        var err = new Error('Please fill in all required fields');
        err.status = 400;
        next(err);
    }

});

// LOG IN
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.get('/login', function (req, res) {
    res.render('login', {title: 'Login', message: 'Login'});
});
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// check the authentication
router.post('/login', function (req, res, next) {
    if (req.body.username && req.body.password) {
        User.authenticate(req.body.username, req.body.password, function (err, user) {
            if (!user) {
                res.redirect('/');
            } else { // create session
                req.session.userid = user._id; // create a new attr. in req.session obj to map the session with user
                res.redirect('/profile');
            }

        })
    } else {
        var err = new Error('All fields are required!');
        err.status = 401; // bad request
        return next(err);
    }
});

// LOG OUT
router.get('/logout', function (req, res, next) {
    if (req.session.userid) {
        // delete the session
        console.log(req.session);
        req.session.destroy(function (err) {
            if (err) return next(err);
            else res.render('logout', {title: 'Logout'});

        });
    } else {
        var err = new Error('Invalid request');
        err.status = 401;
        return next(err);
    }
});

// PROFILE
router.get('/profile', function (req, res, next) {
    if (!req.session.userid) {
        var err = new Error('Please log in first!');
        err.status = 403; // Forbidden
        next(err);
    } else {
        User.findOne({'_id': req.session.userid}).exec(function (err, user) {
            if(err) return next(err);
            res.render('profile', {title: 'Profile', username: user.username});
        })
    }
});

// CHAT
router.get('/chat', function (req, res, next) {
    if (req.session.userid) {
        User.findOne({'_id': req.session.userid}).exec(function (err, user) {
            if(err) return next(err);
            res.render('chat', {title: 'Chat', username: user.username});
        })
    } else {
        res.redirect('/login');
    }
});

// GUIDE REGISTER
router.get('/guideRegister', function (req, res, next) {
    if (!req.session.userid) {
        var err = new Error('Please log in first!');
        err.status = 403; // Forbidden
        next(err);
    } else {
        res.render('guideRegister', {title: 'Guide Register', message: 'Become a guide'})
    }
});

router.post('/guideRegister', function (req, res, next) {
    if (req.body.firstname && req.body.lastname && req.body.age &&
        req.body.gender && req.body.phone && req.body.city && req.body.state &&
        req.body.country && req.body.postcode && req.body.selfintro)
    {
        // find the user info first
        User.findOne({'_id': req.session.userid}).exec(function (err, user) {
            if (err) {
                next(err);
            } else {
                // build the new guide info
                var guide = new Guide();
                guide.guideid = user._id;
                guide.age = req.body.age;
                guide.gender = req.body.gender;
                guide.firstname = req.body.firstname;
                guide.lastname = req.body.lastname;
                guide.phone = req.body.phone;
                guide.email = user.email;
                guide.language = req.body.language;
                guide.selfintro = req.body.selfintro;
                guide.address.street = req.body.street;
                guide.address.city = req.body.city;
                guide.address.country = req.body.country;
                guide.address.state = req.body.state;
                guide.address.postcode = req.body.postcode;
                guide.rating = undefined; // default
                guide.avatar = undefined;
                guide.routes = [];
                guide.services.plane = req.body.plane;
                guide.services.car = req.body.car;
                guide.services.bed = req.body.bed;
                guide.services.cutlery = req.body.cutlery;
                guide.services.camera = req.body.camera;

                guide.save(function (err) {
                    if(err) {
                        return next(err);
                    } else {
                        req.session.guideid = guide.guideid;
                        res.redirect('/profile');
                        console.log("register successfully");
                    }
                });
            }
        });
    } else {
        var err = new Error('Please fill in all required fields');
        err.status = 400;
        next(err);
    }
});


module.exports = router;