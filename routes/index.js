var express = require('express');
var router = express.Router();

// GET index or dashboard page.
router.get('/', function(req, res) {

    var user = req.user;

    if (user) {
        res.render('dashboard');
    } else {
        res.render('index');
    }
});

module.exports = router;
