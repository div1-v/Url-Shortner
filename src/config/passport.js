const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('./../models/user'); // MongoDB User model

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists
        let existingUser = await User.findOne({ googleId: profile.id });

        if (!existingUser) {
          // If user doesn't exist, register a new user
          existingUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            profilePic: profile.photos[0].value,
          });
          await existingUser.save(); // Save to DB
        }

        // Generate a JWT token for the user
        const payload = {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        return done(null, { user: existingUser, token });
      } catch (error) {
        return done(error);
      }
    }
  )
);
