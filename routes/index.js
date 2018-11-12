var express = require('express');
var router = express.Router();

// GET index or dashboard page.
router.get('/', function(req, res) {

    var user = req.user;

    if (user) {
        res.render('index');
    } else {
        res.render('landing');
    }
});

module.exports = router;
