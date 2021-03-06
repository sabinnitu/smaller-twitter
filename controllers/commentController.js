var Comment = require('../models/comment');
var Post = require('../models/post');
var User = require('../models/user');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.comment_list = function(req, res) {

    Post.find({}, 'user message')
        .populate('user')
        .exec(function (err, list_posts) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('post_list', { title: 'Post List', post_list: list_posts });
        });

};

exports.comment_create_post = [

    // Validate fields.
    body('message', 'Message must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {
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
            const errors = validationResult(req);
            var comment = new Comment(
                {
                    user: req.user._id,
                    post: results.post._id,
                    message: req.body.message
                });
                // Data from form is valid. Save comment.
            comment.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new post record.
                res.redirect("/posts/" + comment.post._id);
                console.log("comment added succesfully - id : " + comment._id + " , text : " + comment.message);
            });
        })
    }
];

// Handle post delete on POST.
exports.comment_delete_post = function(req, res, next) {

    backURL=req.header('Referer') || '/';
    async.parallel({
        comment: function(callback) {
            Comment.findById(req.body.commentid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        Comment.findByIdAndRemove(req.body.commentid, function deleteComment(err) {
            if (err) { return next(err); }
            // Success - go to post list
            res.redirect(backURL);
        });
    });

};