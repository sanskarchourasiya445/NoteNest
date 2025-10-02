// ====================== IMPORT REQUIRED MODULES ======================
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const colors = require("colors");              // For colorful console logs
const dotenv = require("dotenv");              // For environment variables
const Notes = require("./models/notes.js");    // Import Notes model
const path = require("path");                  // For handling file paths
const methodOverride = require("method-override"); // To support PUT & DELETE in forms
const ejsMate = require("ejs-mate");           // For EJS layouts/partials
const flash = require("connect-flash");        // Flash messages middleware
const session = require("express-session");// Session management
const MongoStore = require('connect-mongo');    
const passport = require("passport");          // For authentication
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");      // Import User model
const { isLoggedIn } = require("./middleware.js"); // Custom middleware

// Import routers
const notesRouter = require("./routes/notes.js");
const userRouter = require("./routes/user.js");

// ====================== CONFIGURATION ======================
// Load environment variables from .env file
dotenv.config();

// Middleware setup
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(methodOverride("_method")); // Support PUT & DELETE via query string
app.use(express.static(path.join(__dirname, "/public"))); // Serve static assets

// Set up EJS as the view engine with ejs-mate (for layouts/partials)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ====================== DATABASE CONNECTION ======================
const dbUrl = process.env.MONGO_URL;
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("Connected to DB".bgGreen))
  .catch((err) => console.log(err));

// ====================== SESSION & FLASH CONFIG ======================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*60*60,
});

store.on("error",()=>{
console.log("ERROR IN MONGO SESSION STORE",err);
});

const sessionOptions = {
  secret: process.env.SECRET,  // Must be set in .env
  resave: false,
  saveUninitialized: true,
  cookie: {
    expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // Prevents client-side JS from accessing cookies
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ====================== PASSPORT CONFIG ======================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Use passport-local strategy

passport.serializeUser(User.serializeUser());   // Serialize user into session
passport.deserializeUser(User.deserializeUser()); // Deserialize user from session

// ====================== GLOBAL MIDDLEWARE ======================
// Add variables accessible in all templates (flash messages & logged-in user)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ====================== ROUTES ======================
// Root route (just to test if server works)
app.get("/", (req, res) => {
  res.redirect("/Notes");
});

// Notes routes
app.use("/notes", notesRouter);

// User authentication routes
app.use("/", userRouter);

// ====================== START SERVER ======================
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.DEV_MODE} mode on port ${port}`.bgCyan
  );
});
