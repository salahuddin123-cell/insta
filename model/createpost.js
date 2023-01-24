
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PostSchema = new Schema({

User: {
	type: String
},
UserId: {
	type: String
},
Description: {
	type: String
},
Likers:{
	type:[]
},
UserProfile: {
	type: String
},
Profile: {
	type: String
}
}, {
	collection: 'addpost'
})

module.exports = mongoose.model('NewPost', PostSchema)