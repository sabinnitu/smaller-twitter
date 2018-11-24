var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        name: {type: String, required: true, max: 100},
        username: { type: String, unique: true, required: true, trim: true },
        email: { type: String, unique: true, required: true, trim: true },
        password: { type: String, required: true },
        following: [{type: Schema.Types.ObjectId, ref: 'User'}]
    },
    {
        timestamps: true
    }
);



// Virtual for user's URL
UserSchema
    .virtual('url')
    .get(function () {
        return '/users/' + this._id;
    });

UserSchema.methods.isFollowed = function(user) {

    var following = user.following;

    function isInArray(value, array) {
        return array.indexOf(value) > -1;
    }

    return isInArray(this._id, following);
};

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
}