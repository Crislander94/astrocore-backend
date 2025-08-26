import { PrismaClient } from '@prisma/client';
import { UserRepository } from '@/domain/repositories/UserRepository.js';
import { UserEntity } from '@/domain/entities/User.js';
import { prisma } from '@/infrastructure/database/connection.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.db.user.findUnique({
      where: { id },
    });

    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.db.user.findUnique({
      where: { email },
    });

    return user ? this.toDomain(user) : null;
  }

  async create(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const createdUser = await this.db.user.create({
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isActive: user.isActive,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });

    return this.toDomain(createdUser);
  }

  async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity> {
    const updatedUser = await this.db.user.update({
      where: { id },
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: userData.isActive,
        role: userData.role,
        emailVerified: userData.emailVerified,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updatedUser);
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({
      where: { id },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.db.user.count({
      where: { email },
    });

    return count > 0;
  }

  async findMany(page: number, limit: number): Promise<{ users: UserEntity[]; total: number }> {
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.user.count(),
    ]);

    return {
      users: users.map(user => this.toDomain(user)),
      total,
    };
  }

  async verifyEmail(id: string): Promise<UserEntity> {
    const updatedUser = await this.db.user.update({
      where: { id },
      data: {
        emailVerified: true,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updatedUser);
  }

  private toDomain(user: any): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.phone,
      user.isActive,
      user.role,
      user.emailVerified,
      user.createdAt,
      user.updatedAt
    );
  }
}
