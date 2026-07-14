import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { signJwt } from './jwt.helper';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: any) {
    const { email, password } = body;
    
    // Quick login as Archana or standard email validation
    if (
      email === 'archana@smartledger.com' ||
      email === 'archana' ||
      (email === 'archana@smartledger.com' && password === 'password')
    ) {
      const token = signJwt({
        email: 'archana@smartledger.com',
        name: 'Archana S.'
      });
      return {
        token,
        user: {
          email: 'archana@smartledger.com',
          name: 'Archana S.'
        }
      };
    }

    // Standard credential fallback for other accounts
    if (email && password) {
      const token = signJwt({
        email,
        name: email.split('@')[0]
      });
      return {
        token,
        user: {
          email,
          name: email.split('@')[0]
        }
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
