import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/api/users/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  let user = await prisma.user.findUnique({ where: { email: profile.emails?[0].value } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.emails[0].value,
        name: profile.displayName,
        password: ''
      }
    });
  }
  done(null, user);
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  callbackURL: '/api/users/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.emails[0].value,
        name: `${profile.name.givenName} ${profile.name.familyName}`,
        password: ''
      }
    });
  }
  done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
