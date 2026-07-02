import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';

@Injectable()
export class TokensService {
  constructor(private tokensRepository: Repository<Token>) {}

  async save({ userId, refreshToken }: CreateTokenDto) {
    const token = await this.tokensRepository.findOne({ where: { userId } });

    if (!token) {
      this.tokensRepository.create({ userId, refreshToken });
      return;
    }

    token.refreshToken = refreshToken;
    await this.tokensRepository.save(token);
  }

  getByToken(refreshToken: string) {
    return this.tokensRepository.findOne({ where: { refreshToken } });
  }

  async remove(userId: string) {
    await this.tokensRepository.delete(userId);
  }
}
