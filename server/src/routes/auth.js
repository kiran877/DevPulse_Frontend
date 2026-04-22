import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();

// Initialize passport strategy
// Make sure to lazily evaluate process.env in case it's used before env loads
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:4000'}/auth/github/callback`
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Upsert User
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = new User({
          githubId: profile.id,
          username: profile.username,
          avatarUrl: profile._json.avatar_url,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          accessToken: accessToken,
          connectedRepos: []
        });
      } else {
        user.accessToken = accessToken;
        user.avatarUrl = profile._json.avatar_url;
      }
      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Redirect to GitHub
router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email', 'repo' ] })
);

// Callback from GitHub
router.get('/github/callback', 
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication
    const payload = {
      userId: req.user._id,
      githubId: req.user.githubId,
      username: req.user.username
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Redirect back to frontend
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

export default router;
