import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Roles } from '../utils/roles';
import { DROPSHIPPER_REVIEW_STATUS } from './dto/review-dropshipper.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async setBlocked(id: string, blocked: boolean): Promise<User> {
    const user = await this.getById(id);

    if (user.role === Roles.admin) {
      throw new ForbiddenException('Cannot block another admin');
    }

    user.isBlocked = blocked;

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<string> {
    const user = await this.getById(id);

    if (user.role === Roles.admin) {
      throw new ForbiddenException('Cannot delete another admin');
    }

    await this.usersRepository.remove(user);

    return user.id;
  }

  findPendingDropshippers(): Promise<User[]> {
    // activationToken: null — розглядаємо лише тих, хто вже підтвердив пошту.
    // Підтверджувати заявку людини, яка навіть не активувала акаунт, безглуздо.
    return this.usersRepository.find({
      where: {
        role: Roles.dropshipper,
        isApproved: false,
        activationToken: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async reviewDropshipper(
    id: string,
    status: DROPSHIPPER_REVIEW_STATUS,
  ): Promise<{ message: string; user: User }> {
    const user = await this.getById(id);

    if (user.role !== Roles.dropshipper) {
      throw new BadRequestException('User is not a dropshipper');
    }

    if (status === DROPSHIPPER_REVIEW_STATUS.approve) {
      user.isApproved = true;
      user.isBlocked = false;
    } else if (status === DROPSHIPPER_REVIEW_STATUS.reject) {
      // Відхилення = заявку знято, але обліковий запис лишається живим.
      // Користувач стає звичайним покупцем, а дані заявки очищуються.
      //
      // Ключовий момент: role більше не 'dropshipper', а isApproved = true.
      // Саме тому запис зникає зі списку pending. Якщо залишити
      // isApproved = false, картка так і лишалась би на екрані
      // і виглядало б, що кнопка "відхилити" не спрацьовує.
      user.role = Roles.customer;
      user.shopUrl = null;
      user.phone = null;
      user.salesChannel = null;
      user.experience = null;
      user.isApproved = true;
      user.isBlocked = false;
    } else {
      throw new BadRequestException('Incorrect review status');
    }

    await this.usersRepository.save(user);

    return {
      message:
        status === DROPSHIPPER_REVIEW_STATUS.approve
          ? 'Dropshipper approved'
          : 'Dropshipper rejected',
      user,
    };
  }
}
