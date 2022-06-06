var express = require("express");
var router = express.Router();
const passport = require("passport");
var User = require("../models/user");
var Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

router.get("/", function (req, res, next) {
  res.redirect("/sign-in");
});
router.get("/sign-in", function (req, res, next) {
  res.render("sign-in");
});

router.get("/sign-up", (req, res) => res.render("sign-up"));

router.post("/sign-up", [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters."),
  body("email")
    .trim()
    .isLength({ min: 5 })
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be valid"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .escape(),
  body("confirm-password", "Passwords must match").custom((value, { req }) => {
    return value === req.body.password;
  }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("sign-up", {
        title: "Sign up",
        user_data: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
          next(err);
        } else {
          var user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword,
            username: req.body.email.split("@")[0],
          });
          user.save(function (err) {
            if (err) {
              return next(err);
            }
            res.redirect("/sign-in");
          });
        }
      });
    }
  },
]);

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
  Message.find()
    .populate("user")
    .exec((err, messages) => {
      if (err) {
        next(err);
      } else {
        res.render("messages", { messages });
      }
    });
});

router.post("/messages", [
  body("message", "Please Enter A Valid Message")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("user_id").escape(),
  body("title", "Please Enter A Valid Title")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("messages", {
        message_title: req.body.title,
        message_content: req.body.message,
        errors: errors.array(),
      });
      return;
    } else {
      var message = new Message({
        message: req.body.message.trim(),
        title: req.body.title,
        user: req.body.user_id,
      });
      message.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/messages");
      });
    }
  },
]);

router.post("/messages/:id", (req, res, next) => {
  Message.findByIdAndRemove(req.params.id, function deleteInstance(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/messages");
  });
});
router.get("/join", function (req, res, next) {
  res.render("join");
});
router.post("/join", [
  body("join", "Please Enter A Valid Code").escape(),
  body("admin", "Please Enter A Valid Admin Code").escape(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("join", {
        join: req.body.join,
        admin: req.body.admin,
        errors: errors.array(),
      });
      return;
    } else {
      let success = "fail";
      if (req.body.join == process.env.VERIFIED) {
        success = "Verified";
      }
      if (req.body.admin == process.env.ADMIN) {
        success = "Admin";
      }
      if (success !== "fail") {
        var user = new User({
          first_name: res.locals.currentUser.first_name,
          last_name: res.locals.currentUser.last_name,
          email: res.locals.currentUser.email,
          password: res.locals.currentUser.password,
          username: res.locals.currentUser.username,
          status: success,
          _id: res.locals.currentUser._id,
        });
        User.findByIdAndUpdate(
          res.locals.currentUser._id,
          user,
          {},
          (err, theuser) => {
            if (err) {
              return next(err);
            }
            res.render("join", {
              success,
            });
          }
        );
      } else {
        res.render("join", {
          success,
        });
      }
    }
  },
]);

module.exports = router;
