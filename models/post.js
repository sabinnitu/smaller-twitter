var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema(
    {
        user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        message: {type: String, required: true, max: 5000}
    }
);

// Virtual for post's URL
PostSchema
    .virtual('url')
    .get(function () {
        return '/posts/' + this._id;
    });

//Export model
module.exports = mongoose.model('Post', PostSchema);