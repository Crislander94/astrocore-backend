import { VerificationCodeEntity, VerificationCodeType } from '@/domain/entities/VerificationCode.js';

export interface VerificationCodeRepository {
  // Crear código de verificación
  create(code: Omit<VerificationCodeEntity, 'id' | 'createdAt'>): Promise<VerificationCodeEntity>;
  
  // Buscar código por email y tipo
  findByEmailAndType(email: string, type: VerificationCodeType): Promise<VerificationCodeEntity | null>;
  
  // Buscar código válido por email, código y tipo
  findValidCode(email: string, code: string, type: VerificationCodeType): Promise<VerificationCodeEntity | null>;
  
  // Marcar código como usado
  markAsUsed(id: string): Promise<VerificationCodeEntity>;
  
  // Eliminar códigos expirados
  deleteExpired(): Promise<number>;
  
  // Eliminar códigos por email y tipo
  deleteByEmailAndType(email: string, type: VerificationCodeType): Promise<number>;
  
  // Contar códigos activos por email
  countActiveByEmail(email: string): Promise<number>;
}
