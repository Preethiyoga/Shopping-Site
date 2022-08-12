var mongoose = require("mongoose");
var prodschema = new mongoose.Schema({
	name:String,
	image:String,
	price:Number,
	sellername:String,
	sellerno:String,
	
	 
});

module.exports = mongoose.model("Products",prodschema);