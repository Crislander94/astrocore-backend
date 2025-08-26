import { z } from 'zod';

// Schema para código de verificación
export const verificationCodeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum(['LOGIN', 'REGISTER', 'PASSWORD_RESET']),
  isUsed: z.boolean().default(false),
  expiresAt: z.date(),
  createdAt: z.date(),
});

// Schema para crear código de verificación
export const createVerificationCodeSchema = z.object({
  email: z.string().email(),
  type: z.enum(['LOGIN', 'REGISTER', 'PASSWORD_RESET']),
});

// Types
export type VerificationCode = z.infer<typeof verificationCodeSchema>;
export type CreateVerificationCodeDto = z.infer<typeof createVerificationCodeSchema>;
export type VerificationCodeType = 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET';

// VerificationCode Entity Class
export class VerificationCodeEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly code: string,
    public readonly type: VerificationCodeType,
    public readonly isUsed: boolean = false,
    public readonly expiresAt: Date,
    public readonly createdAt: Date = new Date()
  ) {}

  // Verificar si el código ha expirado
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // Verificar si el código es válido
  isValid(): boolean {
    return !this.isUsed && !this.isExpired();
  }

  // Marcar código como usado
  markAsUsed(): VerificationCodeEntity {
    return new VerificationCodeEntity(
      this.id,
      this.email,
      this.code,
      this.type,
      true,
      this.expiresAt,
      this.createdAt
    );
  }

  // Verificar si el código coincide
  matches(inputCode: string): boolean {
    return this.code === inputCode;
  }

  // Generar código de 6 dígitos
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Crear nuevo código de verificación
  static create(
    id: string,
    email: string,
    type: VerificationCodeType,
    expirationMinutes: number = 10
  ): VerificationCodeEntity {
    const code = VerificationCodeEntity.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    return new VerificationCodeEntity(
      id,
      email,
      code,
      type,
      false,
      expiresAt,
      new Date()
    );
  }

  // Obtener mensaje de tipo de código
  getTypeMessage(): string {
    switch (this.type) {
      case 'LOGIN':
        return 'Código de inicio de sesión';
      case 'REGISTER':
        return 'Código de registro';
      case 'PASSWORD_RESET':
        return 'Código de recuperación de contraseña';
      default:
        return 'Código de verificación';
    }
  }

  // Obtener tiempo restante en minutos
  getTimeRemaining(): number {
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60)));
  }
}
