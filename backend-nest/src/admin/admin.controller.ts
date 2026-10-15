import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ReviewDropshipperDto } from './dto/review-dropshipper.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Roles as Role } from '../utils/roles';

@Roles(Role.admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  findAll() {
    return this.adminService.findAll();
  }

  @Get('dropshippers/pending')
  findPendingDropshippers() {
    return this.adminService.findPendingDropshippers();
  }

  @Patch('users/:id/block')
  blockUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.setBlocked(id, true);
  }

  @Patch('users/:id/unblock')
  unblockUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.setBlocked(id, false);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.remove(id);
  }

  @Patch('dropshippers/:id/review')
  reviewDropshipper(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewDropshipperDto,
  ) {
    return this.adminService.reviewDropshipper(id, dto.status);
  }
}
