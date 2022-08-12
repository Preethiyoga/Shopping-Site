var mongoose = require("mongoose");
var cartschema = new mongoose.Schema({
	productimg:String,
	productname :String,
	productprice:Number,
	productqty:Number,
    totalprice:Number
	
});
// cartschema.post('findOneAndDelete',async function(err,data){
// 	if(err){
// 		console.log(err);
// 	}else{
// 	console.log("data deleted");
// 	console.log(data);
// 	}
// })
module.exports = mongoose.model("Cart",cartschema);