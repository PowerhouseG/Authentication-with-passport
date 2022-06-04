var express = require("express");
var router = express.Router();
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
var User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt=require('bcryptjs');

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/sign-in");
});
router.get("/sign-in", function (req, res, next) {
  res.render("sign-in");
});

router.get("/sign-up", (req, res) => res.render("sign-up"));

router.post("/sign-up",[
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
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("sign-up", {
        title: "Sign up",
        user_data: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
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
            // Successful - redirect to new author record.
            res.redirect("/sign-in");
          });
        }
      });
    }
  },
]);

// router.post("/sign-up", (req, res, next) => {
//   // Extract the validation errors from a request.

  
//     // Data from form is valid.
//     bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
//       if (err) {
//         next(err);
//       } else {
//         var user = new User({
//           first_name: req.body.first_name,
//           last_name: req.body.last_name,
//           email: req.body.email,
//           password: hashedPassword,
//           username: req.body.email.split("@")[0],
//         });
//         user.save(function (err) {
//           if (err) {
//             return next(err);
//           }
//           // Successful - redirect to new author record.
//           res.redirect("/sign-in");
//         });
//       }
//     });
  
// });

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
