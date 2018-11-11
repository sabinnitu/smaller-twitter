var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        name: {type: String, required: true, max: 100},
        username: { type: String, unique: true, required: true, trim: true },
        email: { type: String, unique: true, required: true, trim: true },
        password: { type: String, required: true }
    }
);

// Virtual for user's URL
UserSchema
    .virtual('url')
    .get(function () {
        return '/users/' + this._id;
    });

//Export model
module.exports = mongoose.model('User', UserSchema);