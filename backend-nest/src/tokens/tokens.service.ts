import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
  ) {}

  async save(userId: string, refreshToken: string): Promise<Token> {
    const token = await this.tokensRepository.findOne({ where: { userId } });

    if (!token) {
      return this.tokensRepository.save(
        this.tokensRepository.create({ userId, refreshToken }),
      );
    }

    token.refreshToken = refreshToken;
    return this.tokensRepository.save(token);
  }

  findByToken(refreshToken: string): Promise<Token | null> {
    return this.tokensRepository.findOne({ where: { refreshToken } });
  }

  async removeByToken(refreshToken: string): Promise<void> {
    await this.tokensRepository.delete({ refreshToken });
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.tokensRepository.delete({ userId });
  }
}
