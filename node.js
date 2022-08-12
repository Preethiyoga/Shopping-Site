var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose= require("passport-local-mongoose");
var methodOverride = require("method-override");
var flash =require("connect-flash");
var socket = require("socket.io");
const  mongoose = require("mongoose");
var Products = require("./models/product")
var User = require("./models/User");
var Cart = require("./models/cart");

app.use(methodOverride("_method"));
mongoose.connect('mongodb://localhost:27017/shopcart',{
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	//useCreateIndex: true
})
.then(()=>{console.log("connected to db")})
.catch(error => {console.log(error.message)});
var server = app.listen(3000,function(){
	console.log("Server Connected!!!");
})

var io = socket(server);
io.on('connection',function(socket){
	console.log("connection made!!");
	socket.on("chat",function(data){
		io.socket.emit("chat",data);
	})
	
	
})
app.use(bodyparser.urlencoded({extended:true}));


app.use(require("express-session")({
		secret:"JOEY DOESNOT SHARE FOOD",
		resave:false,
		saveUninitialized:false
		}));

app.use(flash());
app.use(function(req,res,next){
 res.locals.success = req.flash("success");
 res.locals.error = req.flash("error");
 next();
		});
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
	res.locals.currentUser= req.user;
	next();
})
app.locals.moment = require("moment");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/",function(req,res){
	
	Products.find({},function(err,allproduct){
		if(err){
			console.log(err);
		}else{
			//const currentUser =  req.user;
			res.render("frontpage.ejs",{product:allproduct});
			// console.log("Curentuser details",typeof(currentUser[username]));
			
		}
	})
	
	
})

app.get("/user",function(req,res){
	User.find({},function(err,alluser){
		if(err){
			console.log(err);
		}else{
			res.render("user.ejs",{user:alluser});
		}
	})
})
// app.get("/:id/filldetail",function(req,res){
// 	User.find(req.params.id,function(err, userdata){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			res.render("userfilldetails",{userdata:userdata});
// 		}
// });
// 	res.render("userfilldetails.ejs");
// })

// app.get("/create-prod",isloggedin,function(req,res){
// 	User.find({},function(err,alluser){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			//res.render("user.ejs",);
// 			res.render("dummy.ejs",{user:alluser});
// 		}
// 	})
	
// })
// app.get("/logout",function(req,res){
	
// 	res.render("logout.ejs");
// })


// app.get("/delete/:d",async(req,res)=>{
// 	
	
// });




app.get("/chat/:id",function(req,res){
	User.findById(req.params.id,function(err,user){
		res.render("chatform.ejs");
	})
})
app.delete("/deleteprod/:id",async(req,res)=>{
	await Products.findByIdAndDelete(req.params.id);
	console.log("products deleted....");
	res.redirect("/");
})
app.delete("/delete/:id",async(req,res)=>{
	
	await Cart.findByIdAndDelete(req.params.id);
			console.log("deleted.....");
			res.redirect("/showcart");
});

app.delete("/deleteuser/:id",async(req,res)=>{
	await User.findByIdAndDelete(req.params.id);
	console.log("user deleted.....");
	res.redirect("/user");
})
app.get("/showcart",function(req,res){
	var userid = req.user.id;
	User.findById(userid).populate("cart").exec(function(err,user){
		if(err){
			console.log(err);
		}else{
			console.log("userdetails with cart info",user);
			res.render("showcart.ejs",{user:user});
				
		}
	})

})
app.get("/addtocart/:id",function(req,res){
 Products.findById(req.params.id,function(err,prdt){
	 res.render("addtocart.ejs",{product:prdt});
 })
	
})
app.post("/addtocart/:id",function(req,res){
	var productimg=req.body.prodimg;
	var productname = req.body.prodname;
	var productprice = req.body.prodprice;
	var qty = req.body.qty;
	var total = productprice*qty;
	var cartitems={productimg:productimg,productname:productname,productprice:productprice,productqty:qty,totalprice:total};
	console.log("cartitems",cartitems);
	var id = req.user.id;
	User.findById(id,function(err,user){
		Cart.create(cartitems,function(err,cartprdt){
			if(err){
				console.log(err);
			}else{
				console.log("added",cartprdt);
				user.cart.push(cartprdt);
				user.save();
				res.redirect("/");
			
			}
		});
	});
	
});

app.get("/register",function(req,res){
	res.render("signup.ejs");
})

app.post("/register",function(req,res){
	req.body.username
	req.body.password
	req.body.email
	req.body.number
	User.register(
		new User({
		username:req.body.username,email:req.body.email,phoneno:req.body.number}),req.body.password,function(err,user)
		{
		if(err){
			
	    	req.flash("error","NO USERNAME EXITS");
			console.log(err);
			
			
		}else{
			
			passport.authenticate("local")(req,res,function(){
				req.flash("success","Welcome To our site  "+ user.username);
				res.redirect("/");
				console.log("Signed up successfully!!");
				console.log(user);
			});
			
		}
	});
});

app.get("/login",function(req,res){
	res.render("login.ejs");
})

app.post("/login",passport.authenticate("local",{ failureFlash:true,failureRedirect: "/login"
}),function (req,res){
	req.flash("success","Logged in!");
	res.redirect("/");
});

app.get("/logout",function(req,res){
	req.logout();
	req.flash("success","Logged Out");
	res.redirect("/");
});

app.get("/create-prod/:id",function(req,res){
		User.findById(req.params.id,function(err, userdata){
		if(err){
 			console.log(err);
 		}else{
 			res.render("addprod.ejs",{userdata:userdata});
 		}
		});
})
 app.post("/create-prod/:id",function(req,res){
	 var productname = req.body.prodname;
	 var productlink = req.body.prodlink;
	 var productprice = req.body.prodprice;
	 var sellername = req.body.sellername;
	 var sellerno = req.body.sellerphnno;
	 var newprod = {name:productname,image:productlink,price:productprice,sellername:sellername,sellerno:sellerno};
	 Products.create(newprod,function(err,newproduct){
		 if(err){
			 console.log(err);
		 }else{
			 res.redirect("/");
			 console.log("Successfully added",newproduct);
		 }
	 })
 })

app.get("/prod/:id",function(req,res){
	Products.findById(req.params.id,function(err,productdetail){
		if(err){
			console.log(err);
		}else{
			res.render("moredetails.ejs",{product:productdetail});
			console.log(productdetail)
		}
	});
	
});






function isloggedin(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
	req.flash("error","!!!!Please Login First");
	
}


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("successfully connected");
});