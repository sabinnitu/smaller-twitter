var express = require('express');
var router = express.Router();

// Require controller modules.
var user_controller = require('../controllers/userController');

/// USER ROUTES ///

// GET request for creating a User. NOTE This must come before routes that display User (uses id).
router.get('/create', ensureAuthenticated, user_controller.user_create_get);

// POST request for creating User.
router.post('/create', ensureAuthenticated, user_controller.user_create_post);


// GET request to delete User.
router.get('/:id/delete', ensureAuthenticated, user_controller.user_delete_get);

// POST request to delete User.
router.post('/:id/delete', ensureAuthenticated, user_controller.user_delete_post);

// GET request to update User.
router.get('/:id/update', ensureAuthenticated, user_controller.user_update_get);

// POST request to update User.
router.post('/:id/update', ensureAuthenticated, user_controller.user_update_post);

// GET request for one User.
router.get('/:id', ensureAuthenticated, user_controller.user_detail);

// GET request for list of all User items.
router.get('/', ensureAuthenticated, user_controller.user_list);

router.get('/:id/follow', ensureAuthenticated, user_controller.follow);

router.get('/:id/unfollow', ensureAuthenticated, user_controller.unfollow);

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/login');
    }
}

module.exports = router;