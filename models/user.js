const mongoose = require('mongoose');
// shorten the call for mongoose.Schema
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        // sets for index, not for authorization / validation
        unique: true
    }
});

// we do not need to create username, hash and salt field by our own,
// Passport-Local Mongoose will add them for us to store the username,
// the hashed password and the salt value.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);