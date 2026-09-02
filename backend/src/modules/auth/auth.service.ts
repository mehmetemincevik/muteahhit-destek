import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException('Bu telefon numarasıyla zaten bir hesap var');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = this.userRepo.create({
      role: dto.role,
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      passwordHash,
    });
    await this.userRepo.save(user);

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    // passwordHash entity'de select: false olduğu için burada açıkça istenir.
    const user = await this.userRepo.findOne({
      where: { phone: dto.phone },
      select: ['id', 'role', 'fullName', 'phone', 'email', 'passwordHash'],
    });
    if (!user) {
      throw new UnauthorizedException('Telefon numarası veya şifre hatalı');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Telefon numarası veya şifre hatalı');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    // Yanıt alanları açıkça seçilir; passwordHash dışarı çıkmamalı.
    // Entity doğrudan döndürülürse bu alan da serileşir.
    return {
      accessToken: token,
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
      },
    };
  }
}
