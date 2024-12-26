const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
//const User = require("../models/User"); // Your User model
const router = express.Router();

const registerUser = async (req, res) => {
  try {
    const { user, token } = req.user;

    res.json({
      message: "Registration or Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

// Register route using Google OAuth
router.get(
  "/google/register",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback route after Google OAuth authentication
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  registerUser
);

module.exports = router;
