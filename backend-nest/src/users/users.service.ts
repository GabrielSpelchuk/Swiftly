import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles } from '../utils/roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findWithPassword(
    id: string,
  ): Promise<Pick<User, 'id' | 'password'> | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: { id: true, password: true },
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<(Pick<User, 'id' | 'password'> & Partial<User>) | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        password: true,
        email: true,
        name: true,
        role: true,
        activationToken: true,
        isBlocked: true,
        balance: true,
        isApproved: true,
      },
    });
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const {
      name,
      email,
      password,
      role = Roles.customer,
      phone,
      shopUrl,
      salesChannel,
      experience,
    } = createUserDto;

    const existUser = await this.findByEmail(email);

    if (existUser) {
      throw new ConflictException('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const activationToken = randomUUID();
    const isDropshipper = role === Roles.dropshipper;

    const user = this.usersRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      activationToken,
      role,

      isApproved: !isDropshipper,
      phone: isDropshipper ? phone?.trim() : null,
      shopUrl: isDropshipper ? shopUrl?.trim() : null,
      salesChannel: isDropshipper ? salesChannel : null,
      experience: isDropshipper ? experience?.trim() : null,
    });

    return this.usersRepository.save(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const {
      name,
      phone,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
    } = updateProfileDto;

    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wantsEmailChange = !!email && email !== user.email;
    const wantsPasswordChange = !!newPassword;

    if (wantsEmailChange || wantsPasswordChange) {
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const userWithPassword = await this.usersRepository.findOne({
        where: { id: userId },
        select: { id: true, password: true },
      });

      const isValid = userWithPassword
        ? await bcrypt.compare(currentPassword, userWithPassword.password)
        : false;

      if (!isValid) {
        throw new BadRequestException('Incorrect current password');
      }
    }

    if (wantsEmailChange) {
      const existUser = await this.findByEmail(email);

      if (existUser) {
        throw new ConflictException('Email is already taken');
      }

      user.email = email.trim().toLowerCase();
    }

    if (wantsPasswordChange) {
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone?.trim() || null;

    return this.usersRepository.save(user);
  }

  async activate(activationToken: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { activationToken },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired activation token');
    }

    user.activationToken = null;
    return this.usersRepository.save(user);
  }

  async updateResetToken(userId: string, resetToken: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { resetToken });
  }

  async findByResetToken(resetToken: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { resetToken } });
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { password, resetToken: null },
    );
  }

  async remove(id: string): Promise<string> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User with that id doesnt exist');
    }

    await this.usersRepository.remove(user);

    return user.id;
  }
}
