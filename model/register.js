
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RegisterSchema = new Schema({

Name: {
	type: String
},

Email: {
	type: String
},
Password: {
	type: String
},
Follower:{
	type:[]
},
Following: {
	type: []
},
Liked:{
	type:[]
},
Messages:{
	type:[]
},

Profile: {
	type: String
}
}, {
	collection: 'addregistration'
})

module.exports = mongoose.model('NewRegistration', RegisterSchema)