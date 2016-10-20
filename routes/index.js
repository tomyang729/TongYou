var express = require('express');
var router = express.Router();
var path = require('path');

// import models
var User = require('../models/user.js');


// HOME PAGE
router.get('/', function (req, res) {
    res.render('index', {title: 'Home Page', message: 'Welcome to TongYou!'});
    //res.sendFile(path.join(__dirname, '../public/html', 'index.html'));
});

// SIGN UP
router.get('/signup', function (req, res) {
    res.render('signup', {title: 'Sign Up', message: 'Sign Up'});
});

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
router.get('/login', function (req, res) {
    res.render('login', {title: 'Login', message: 'Login'});
});

// check the authentication
router.post('/login', function (req, res, next) {
    if (req.body.username && req.body.password) {
        User.authenticate(req.body.username, req.body.password, function (err, user) {
            if (err || !user) {
                var err = new Error('Incorrect username or password');
                err.status = 401; // bad request
                return next(err);
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


module.exports = router;