const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FollowSchema = new Schema({

UserId: {
	type: String
},


FollowingUser: {
	type: String
},
FollowingUserId: {
	type: String
}

}, {
	collection: 'following'
})

module.exports = mongoose.model('NewFollow', FollowSchema)