var express = require('express');
var router = express.Router();

var Post = require('../models/post');

// GET index or dashboard page.
router.get('/', function(req, res) {

    var user = req.user;

    if (user) {

        Post.find({ 'user': req.user.following }, 'user message createdAt')
            .populate('user')
            .exec(function (err, list_posts) {
                if (err) { return next(err); }
                //Successful, so render
                res.render('index', { post_list: list_posts });
            });

    } else {
        res.render('auth/auth');
    }
});

module.exports = router;
