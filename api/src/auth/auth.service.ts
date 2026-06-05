import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '#/users/users.service';
import type { UserPublic } from '#/users/constants/user-public.select';
import { PrismaService } from '#/prisma/prisma.service';
import { isDefined } from '#util/parse.utils';
import { AUTH_ERRORS } from './constants/auth-errors.constants';
import { DUMMY_PASSWORD_HASH } from './constants/auth.constants';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt email=${loginDto.email}`);

    const user = await this.prisma.user.findFirst({
      where: { email: loginDto.email, deletedAt: null },
      select: { id: true, email: true, password: true, role: true, headquarterId: true },
    });

    // Dummy password used for timing-attack mitigation
    const passwordHash = isDefined(user) ? user.password : DUMMY_PASSWORD_HASH;
    const passwordMatches = await bcrypt.compare(loginDto.password, passwordHash);

    if (!isDefined(user) || !passwordMatches) {
      this.logger.warn(`Failed login attempt email=${loginDto.email}`);
      throw new UnauthorizedException(AUTH_ERRORS.invalidCredentials);
    }

    const publicUser = await this.usersService.findOne(user.id);
    return this.buildAuthResponse(publicUser);
  }

  private buildAuthResponse(user: UserPublic): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      headquarterId: user.headquarterId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
