var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
    {
        post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
        user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        message: {type: String, required: true, max: 5000}
    },
    {
        timestamps: true
    }
);

// Virtual for post's URL
CommentSchema
    .virtual('url')
    .get(function () {
        return '/posts/' + this._id;
    });

//Export model
module.exports = mongoose.model('Comment', CommentSchema);