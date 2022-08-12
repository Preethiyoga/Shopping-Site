var mongoose = require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var userschema = new mongoose.Schema({
	username:String,
	password:String,
	email:String,
	phoneno:Number,
    cart:[
	 {
	  type: mongoose.Schema.Types.ObjectId,
	  ref: "Cart"
     }
		
	],
	totalcartprice:{
		type:Number,
		default:0
	}
	
});


userschema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userschema);