import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, UserStatus } from '../../common/constants/roles';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      name: dto.name ?? null,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      authProviders: [
        {
          provider: 'password',
          providerUserId: dto.email.toLowerCase().trim(),
          email: dto.email.toLowerCase().trim(),
          linkedAt: new Date(),
        },
      ],
    });

    return this.buildAuthResponse(user.id as string, user.email, user.role);
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.touchLogin(user.id as string, ip);
    return this.buildAuthResponse(user.id as string, user.email, user.role);
  }

  private buildAuthResponse(userId: string, email: string, role: UserRole) {
    const accessToken = this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
    return {
      accessToken,
      user: { id: userId, email, role },
    };
  }
}
