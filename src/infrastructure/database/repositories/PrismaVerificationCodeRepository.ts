import { PrismaClient } from '@prisma/client';
import { VerificationCodeRepository } from '@/domain/repositories/VerificationCodeRepository.js';
import { VerificationCodeEntity, VerificationCodeType } from '@/domain/entities/VerificationCode.js';
import { prisma } from '@/infrastructure/database/connection.js';

export class PrismaVerificationCodeRepository implements VerificationCodeRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async create(code: Omit<VerificationCodeEntity, 'id' | 'createdAt'>): Promise<VerificationCodeEntity> {
    const createdCode = await this.db.verificationCode.create({
      data: {
        email: code.email,
        code: code.code,
        type: code.type,
        isUsed: code.isUsed,
        expiresAt: code.expiresAt,
      },
    });

    return this.toDomain(createdCode);
  }

  async findByEmailAndType(email: string, type: VerificationCodeType): Promise<VerificationCodeEntity | null> {
    const code = await this.db.verificationCode.findFirst({
      where: {
        email,
        type,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return code ? this.toDomain(code) : null;
  }

  async findValidCode(
    email: string,
    code: string,
    type: VerificationCodeType
  ): Promise<VerificationCodeEntity | null> {
    const verificationCode = await this.db.verificationCode.findFirst({
      where: {
        email,
        code,
        type,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return verificationCode ? this.toDomain(verificationCode) : null;
  }

  async markAsUsed(id: string): Promise<VerificationCodeEntity> {
    const updatedCode = await this.db.verificationCode.update({
      where: { id },
      data: {
        isUsed: true,
      },
    });

    return this.toDomain(updatedCode);
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db.verificationCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  async deleteByEmailAndType(email: string, type: VerificationCodeType): Promise<number> {
    const result = await this.db.verificationCode.deleteMany({
      where: {
        email,
        type,
      },
    });

    return result.count;
  }

  async countActiveByEmail(email: string): Promise<number> {
    return await this.db.verificationCode.count({
      where: {
        email,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  private toDomain(code: any): VerificationCodeEntity {
    return new VerificationCodeEntity(
      code.id,
      code.email,
      code.code,
      code.type,
      code.isUsed,
      code.expiresAt,
      code.createdAt
    );
  }
}
