import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from './current-user.decorator';
import { User } from './user.entity';
import { UpdateProfileDto } from './update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    return await this.usersService.getProfile(user.id);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }
}
