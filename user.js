
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/user', function(err, res){
	if(err){
		console.log("Error__");
	}
	else{
		console.log("Success");
	}
});

var userSchema = new mongoose.Schema({
	username: String,
	password: String
},{collection: 'info'});

exports.User = db.model('User', userSchema);