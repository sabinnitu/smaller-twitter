var express = require('express');
var router = express.Router();

// Require controller modules.
var post_controller = require('../controllers/postController');
var comment_controller = require ('../controllers/commentController');

/// POST ROUTES ///

// GET request for creating a Post. NOTE This must come before routes that display Post (uses id).
router.get('/create', ensureAuthenticated, post_controller.post_create_get);

// POST request for creating Post.
router.post('/create', ensureAuthenticated, post_controller.post_create_post);

// GET request to delete Post.
router.get('/:id/delete', ensureAuthenticated, post_controller.post_delete_get);

// POST request to delete Post.
router.post('/:id/delete', ensureAuthenticated, post_controller.post_delete_post);

// GET request to update Post.
router.get('/:id/update', ensureAuthenticated, post_controller.post_update_get);

// POST request to update Post.
router.post('/:id/update', ensureAuthenticated, post_controller.post_update_post);

// GET request for one Post.
router.get('/:id', ensureAuthenticated, post_controller.post_detail);
router.post('/:id', ensureAuthenticated,comment_controller.comment_create_post);

// GET request for list of all Post items.
router.get('/', ensureAuthenticated, post_controller.post_list);

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/login');
    }
}

module.exports = router;