const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let chatSchema = new Schema({
user: {
		type: String,
	},
id: {
	type: String,
	
},
room: {
	type: String
},
time:{
	type:Date,
},
message: {
	type: String
}
}, {
	collection: 'chat2'
})

module.exports = mongoose.model('Newchat', chatSchema)