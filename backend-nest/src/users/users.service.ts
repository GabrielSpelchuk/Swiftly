import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { IUser } from 'src/utils/user';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/utils/roles';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<IUser> {
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

    if (newPassword || (email && email !== user.email)) {
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new BadRequestException('Incorrect current password');
      }
    }

    if (email && email !== user.email) {
      const existUser = await this.findByEmail(email);
      if (existUser) {
        throw new BadRequestException('Email is already taken');
      }
      user.email = email;
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone?.trim() || null;

    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }

  async register(createUserDto: CreateUserDto) {
    const {
      name,
      email,
      password,
      role = Roles.customer,
      phone = null,
      shopUrl = null,
      salesChannel = null,
      experience = null,
      isApproved = true,
    } = createUserDto;

    const existUser = await this.findByEmail(email);

    if (existUser) {
      throw new BadRequestException('Email is already exist');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const activationToken = uuidv4();
    const isDropshipper = role === Roles.dropshipper;

    this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      activationToken,
      role,
      phone: isDropshipper ? phone?.trim() : null,
      shopUrl: isDropshipper ? shopUrl?.trim() : null,
      salesChannel: isDropshipper ? salesChannel : null,
      experience: isDropshipper ? experience?.trim() : null,
      isApproved,
    });

    //await sendActivationEmail(email, activationToken);
  }

  async updateResetToken(userId: string, resetToken: string) {
    return await this.usersRepository.update(userId, { resetToken });
  }

  async findByResetToken(resetToken: string) {
    return await this.usersRepository.findOne({ where: { resetToken } });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return await this.usersRepository.update(userId, {
      password: hashedPassword,
      resetToken: null,
    });
  }

  async delete(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User with that id doesnt exist');
    }

    await this.usersRepository.remove(user);

    return user.id;
  }
}
