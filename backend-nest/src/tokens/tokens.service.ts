import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';

const MAX_SESSIONS_PER_USER = 5;

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
  ) {}

  /**
   * Кожен вхід створює НОВИЙ рядок, а не перезаписує старий.
   *
   * Раніше тут був upsert за userId: логін на другому пристрої (або
   * просто повторний тестовий логін) перезаписував токен — і всі інші
   * сесії цього користувача миттєво отримували 401.
   */
  async save(userId: string, refreshToken: string): Promise<Token> {
    const token = await this.tokensRepository.save(
      this.tokensRepository.create({ userId, refreshToken }),
    );

    await this.pruneOldSessions(userId);

    return token;
  }

  private async pruneOldSessions(userId: string): Promise<void> {
    const tokens = await this.tokensRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const stale = tokens.slice(MAX_SESSIONS_PER_USER);

    if (stale.length === 0) {
      return;
    }

    await this.tokensRepository.delete(stale.map((t) => t.id));
    this.logger.debug(`Pruned ${stale.length} stale session(s) for user ${userId}`);
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