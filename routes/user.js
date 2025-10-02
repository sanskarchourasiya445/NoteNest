const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const {isLoggedIn} = require("../middleware.js");


router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res,next) => {
  try {
    let { email, username, password } = req.body;
    let newUser = new User({ email, username });
    let registeredUser = await User.register(newUser, password);
    req.login(registeredUser,(err)=>{
      if(err){
        next(err);
      }
    res.redirect("/Notes");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login",failureFlash : true }),
  async (req, res) => {
    res.redirect("/Notes");
  }
);

router.get("/logout",isLoggedIn,(req,res,next)=>{
  req.logOut((err) =>{
    if(err){
      next(err);
    }
    req.flash("success","You are logged out!");
    res.redirect("/Notes");
  });
  
});

module.exports = router;