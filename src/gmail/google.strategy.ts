import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';



@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.REDIRECT_URI,
      scope: ['email', 'profile'],
     
    });
    console.log("clientid", process.env.GOOGLE_CLIENT_ID)
    console.log("clientSecret", process.env.GOOGLE_SECRET)
    console.log("callbackurl", process.env.REDIRECT_URI)
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails, photos } = profile
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken
    }
    done(null, user);
  }
}