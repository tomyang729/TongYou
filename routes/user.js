var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

// USER
router.get('/', function (req, res) {
    User.find({}, function (err, user) {
        if(err) return handleError(err);
        res.send(user);
    })
});

router.get('/test', function (req, res) {
    res.render('test', {title: 'test'});
});

router.get('/finduser', function (req, res) {
    User.find({username: req.query.username}, function (err, user) {
        if(err) res.send(err);
        else {
            res.send(user);
        }
    })
});

router.delete('/:user_id', function (req, res) {
    User.remove({_id: req.params.user_id}, function (err, user) {
        if (err) res.send(err);
        else {
            console.log(res);
            res.send("delete " + req.params.user_id + " successfully");
        }
    });
});

module.exports = router;

