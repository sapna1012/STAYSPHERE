if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");


const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");
// ------------------ Environment Validation ------------------
const dbUrl = process.env.ATLASDS_URL;
const sessionSecret = process.env.SESSION_SECRET;

if (!dbUrl) {
  console.error("❌ ATLASDB_URL is missing in .env");
  process.exit(1);
}

if (!sessionSecret) {
  console.warn(
    "⚠️ SESSION_SECRET is missing in .env. Using fallback secret (not secure for production)."
  );
}

// ------------------ Database Connection ------------------
async function connectDB() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  }
}
connectDB();


// ------------------ App Config ------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true })); // ✅ parse form data
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
  secret:process.env.SESSION_SECRET,
  },
  touchAfter:24*3600
});

store.on("error",()=>{
  console.log("Error in MONGO SESSION STORE",err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


// ------------------ Routes ------------------
// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});


//Demo User
// app.get("/demouser",async(req,res)=>{
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"delta-student",
//   });
//   let registeredUser = await User.register(fakeUser,"helloWorld");
//   res.send(registeredUser);
// });
// ------------------ Validators ------------------
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Listings routes (moved to separate router)
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// About Page Route
app.get("/about", (req, res) => {
  res.render("about");   // looks for views/about.ejs
});

app.get("/services", (req, res) => {
  res.render("services");  
});

app.get("/experience", (req, res) => {
  res.render("experience");   
});

// ------------------ Error Handlers ------------------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});


// ------------------ Server ------------------
app.listen(8080, () => {
  console.log("🚀 Server is listening on port 8080");
});
