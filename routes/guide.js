var express = require('express');
var router = express.Router();
var Guide = require('../models/guide.js');

router.get('/', function (req, res) {
    Guide.find({}, function (err, guides) {
        if(err) return handleError(err);
        res.send(guides);
    });
});

router.delete('/:guide_id', function (req, res) {
    Guide.remove({guideid: req.params.guide_id}, function (err, guide) {
        if (err) res.send(err);
        else {
            res.send("delete " + req.params.guide_id + " successfully");
        }
    });
});

module.exports = router;
