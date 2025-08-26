import { UserEntity } from '@/domain/entities/User.js';

export interface UserRepository {
  // Buscar usuario por ID
  findById(id: string): Promise<UserEntity | null>;
  
  // Buscar usuario por email
  findByEmail(email: string): Promise<UserEntity | null>;
  
  // Crear nuevo usuario
  create(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
  
  // Actualizar usuario
  update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
  
  // Eliminar usuario
  delete(id: string): Promise<void>;
  
  // Verificar si existe usuario por email
  existsByEmail(email: string): Promise<boolean>;
  
  // Listar usuarios con paginación
  findMany(page: number, limit: number): Promise<{
    users: UserEntity[];
    total: number;
  }>;
  
  // Verificar email de usuario
  verifyEmail(id: string): Promise<UserEntity>;
}
