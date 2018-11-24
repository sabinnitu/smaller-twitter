var Post = require('../models/post');
var User = require('../models/user');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all posts.
exports.post_list = function(req, res) {

    Post.find({}, 'user message')
        .populate('user')
        .exec(function (err, list_posts) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('post_list', { title: 'Post List', post_list: list_posts });
        });

};

// Display detail page for a specific post.
exports.post_detail = function(req, res, next) {

    async.parallel({
        post: function(callback) {

            Post.findById(req.params.id)
                .populate('user')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.post==null) { // No results.
            var err = new Error('Post not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('post_detail', { post: results.post, user: req.user } );
    });

};

// Display post create form on GET.
exports.post_create_get = function(req, res, next) {

    async.parallel({

    }, function(err, results) {
        if (err) { return next(err); }
        res.render('post_form', { title: 'Create Post' });
    });

};

// Handle post create on POST.
exports.post_create_post = [

    // Validate fields.
    body('message', 'Message must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Post object with escaped and trimmed data.
        var post = new Post(
            {
                user: req.user._id,
                message: req.body.message
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            async.parallel({

            }, function(err, results) {
                if (err) { return next(err); }
                res.render('post_form', { title: 'Create Post', post: post, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save post.
            post.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new post record.
                res.redirect(post.url);
            });
        }
    }
];

// Display post delete form on GET.
exports.post_delete_get = function(req, res, next) {

    async.parallel({
        post: function(callback) {
            Post.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.post==null) { // No results.
            res.redirect('/posts');
        }
        // Successful, so render.
        res.render('post_delete', { title: 'Delete Post', post: results.post } );
    });

};

// Handle post delete on POST.
exports.post_delete_post = function(req, res, next) {

    async.parallel({
        post: function(callback) {
            Post.findById(req.body.postid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        Post.findByIdAndRemove(req.body.postid, function deletePost(err) {
            if (err) { return next(err); }
            // Success - go to post list
            res.redirect('/posts')
        });
    });

};

// Display post update form on GET.
exports.post_update_get = function(req, res, next) {

    // Get post for form.
    async.parallel({
        post: function(callback) {
            Post.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.post==null) { // No results.
            var err = new Error('Post not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('post_form', { title: 'Update Post', post: results.post });
    });

};

// Handle post update on POST.
exports.post_update_post = [

    // Validate fields.
    body('message', 'Message must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('message').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Post object with escaped/trimmed data and old id.
        var post = new Post(
            {
                user: req.user._id,
                message: req.body.message,
                _id:req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({

            }, function(err, results) {
                if (err) { return next(err); }

                res.render('post_form', { title: 'Update Post', post: post, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Post.findByIdAndUpdate(req.params.id, post, {}, function (err,thepost) {
                if (err) { return next(err); }
                // Successful - redirect to post detail page.
                res.redirect(thepost.url);
            });
        }
    }
];