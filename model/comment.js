const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CommentSchema = new Schema({

User: {
	type: String
},
PostId: {
	type: String
},

Comment: {
	type: String
}

}, {
	collection: 'comment'
})

module.exports = mongoose.model('NewComment', CommentSchema)