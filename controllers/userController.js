var User = require('../models/user');
var Post = require('../models/post');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var dateFormat = require('dateformat');

var async = require('async');

// Display list of all users.
exports.user_list = function(req, res) {
        //var currentUser = User.x(req.user)
    User.find({}, 'name username email createdAt')
        .exec(function (err, list_users) {
            if (err) { return next(err); }
            //Successful, so render
            var loggedUser = req.user;
            res.render('user_list', { title: 'User List', user_list: list_users, loggedUser: loggedUser, dateFormat: dateFormat });
        });

};

// Display detail page for a specific user.
exports.user_detail = function(req, res, next) {

    async.parallel({
        user: function(callback) {
            User.findById(req.params.id)
                .exec(callback);
        },
        posts: function(callback) {
            Post.find({ 'user': req.params.id }, 'message')
                .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user==null) { // No results.
            var err = new Error('Post not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('user_detail', { user: results.user, posts: results.posts });
    });

};

// Display user create form on GET.
exports.user_create_get = function(req, res, next) {

    async.parallel({

    }, function(err, results) {
        if (err) { return next(err); }
        res.render('user_form', { title: 'Create User' });
    });

};

// Handle user create on POST.
exports.user_create_post = [

    // Validate fields.
    body('name', 'Name must not be empty.').isLength({ min: 1 }).trim(),
    body('username', 'Username must not be empty.').isLength({ min: 1 }).trim(),
    body('email', 'Email must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'Password must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a User object with escaped and trimmed data.
        var user = new User(
            {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all posts and genres for form.
            async.parallel({

            }, function(err, results) {
                if (err) { return next(err); }
                res.render('user_form', { title: 'Create User', user: user, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save post.
            user.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new post record.
                res.redirect(user.url);
            });
        }
    }
];

// Display user delete form on GET.
exports.user_delete_get = function(req, res, next) {

    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user==null) { // No results.
            res.redirect('/users');
        }
        // Successful, so render.
        res.render('user_delete', { title: 'Delete User', user: results.user } );
    });

};

// Handle user delete on POST.
exports.user_delete_post = function(req, res, next) {

    async.parallel({
        user: function(callback) {
            User.findById(req.body.userid).exec(callback)
        },
        users_posts: function(callback) {
            Post.find({ 'user': req.body.userid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.users_posts.length > 0) {
            // User has posts. Render in same way as for GET route.
            res.render('user_delete', { title: 'Delete User', user: results.user, user_posts: results.users_posts } );
            return;
        }
        else {
            // User has no posts. Delete object and redirect to the list of users.
            User.findByIdAndRemove(req.body.userid, function deleteUser(err) {
                if (err) { return next(err); }
                // Success - go to user list
                res.redirect('/users')
            })
        }
    });

};

// Display user update form on GET.
exports.user_update_get = function(req, res, next) {

    // Get user for form.
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user==null) { // No results.
            var err = new Error('Post not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('user_form', { title: 'Update User', user: results.user });
    });

};

// Handle user update on POST.
exports.user_update_post = [

    // Validate fields.
    body('name', 'Name must not be empty.').isLength({ min: 1 }).trim(),
    body('username', 'Username must not be empty.').isLength({ min: 1 }).trim(),
    body('email', 'Email must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('email').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a User object with escaped/trimmed data and old id.
        var user = new User(
            {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                _id:req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({

            }, function(err, results) {
                if (err) { return next(err); }

                res.render('user_form', { title: 'Update User', user: user, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(req.params.id, user, {}, function (err,theuser) {
                if (err) { return next(err); }
                // Successful - redirect to user detail page.
                res.redirect(theuser.url);
            });
        }
    }
];

// Follow
exports.follow = [

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        var user = req.user;
        user.following.push(req.params.id);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({}, function (err, results) {
                if (err) {
                    return next(err);
                }

                res.render('user_list', {title: 'Following', user: user, errors: errors.array()});
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(user._id, user, {}, function (err, theuser) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to user detail page.
                res.redirect('/users');
            });
        }
    }
];

// Unfollow
exports.unfollow = [

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        var user = req.user;
        var following = user.following;

        var array = following;
        var index = array.indexOf(req.params.id);
        if (index > -1) {
            array.splice(index, 1);
        }

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({}, function (err, results) {
                if (err) {
                    return next(err);
                }

                res.render('user_list', {title: 'Following', user: user, errors: errors.array()});
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(user._id, user, {}, function (err, theuser) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to user detail page.
                res.redirect('/users');
            });
        }
    }
];