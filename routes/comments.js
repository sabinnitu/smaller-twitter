var express = require('express');
var router = express.Router();

// Require controller modules.
var comment_controller = require ('../controllers/commentController');

router.post('/:id/delete', comment_controller.comment_delete_post);

module.exports = router;