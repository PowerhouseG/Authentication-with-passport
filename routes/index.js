var express = require("express");
var router = express.Router();
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
var User = require("../models/user");


/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/sign-in");
});
router.get("/sign-in", function (req, res, next) {
  res.render("sign-in");
});

router.get("/sign-up", (req, res) => res.render("sign-up"));

router.post("/sign-up", (req, res, next) => {
  const user = new User({
    username: req.body.email.split("@")[0],
    password: req.body.password,
  }).save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/sign-in");
  });
});
router.post(
  "/sign-in",
  passport.authenticate("local", {
    successRedirect: "/messages",
    failureRedirect: "/",
  })
);

router.get("/log-out", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
router.get("/messages", function (req, res, next) {
  res.render("messages");
});

module.exports = router;
