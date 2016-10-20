var express = require('express');
var router = express.Router();
var request = require('request');
var Guide = require('../models/guide.js');
var _ = require('underscore');

// SEARCH
router.get('/', function (req, res) {
    var addressComponents = req.query.place.split(", ");
    Guide.find({}, function (err, guides) {
        if (err) handleError(err);
        else {
            var result = _.filter(guides, function (guide) {
                for (var i=0; i < addressComponents.length; i++) {
                    if (guide.address.city.toLowerCase() === addressComponents[i].toLowerCase()) break;
                    else {
                        if (i === addressComponents.length-1) return false;
                    }
                }
                for (var i=0; i < addressComponents.length; i++) {
                    if (guide.address.country.toLowerCase() === addressComponents[i].toLowerCase())
                        return true;
                }
                return false;
            });
            res.send(result);
        }
    });
});

module.exports = router;

