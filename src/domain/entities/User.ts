import { z } from 'zod';

// Schema para usuario (sin password - sistema passwordless)
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).default('CUSTOMER'),
  emailVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para login (solo email - alineado con frontend)
export const requestLoginSchema = z.object({
  email: z.string().email().min(1, "El email es obligatorio"),
});

// Schema para registro (alineado con frontend)
export const requestRegisterSchema = z.object({
  email: z.string().email().min(1, "El email es obligatorio"),
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
});

// Schema para verificar código
export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

// Schema para actualizar perfil
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// Schema para respuesta de usuario (sin datos sensibles)
export const userResponseSchema = userSchema.omit({});

// Schema para respuesta de autenticación
export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

// Types (alineados con frontend)
export type User = z.infer<typeof userSchema>;
export type RequestLogin = z.infer<typeof requestLoginSchema>;
export type RequestRegister = z.infer<typeof requestRegisterSchema>;
export type VerifyCodeDto = z.infer<typeof verifyCodeSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

// User Entity Class
export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string | undefined = undefined,
    public readonly isActive: boolean = true,
    public readonly role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' = 'CUSTOMER',
    public readonly emailVerified: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Obtener nombre completo
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Verificar si es admin
  isAdmin(): boolean {
    return this.role === 'ADMIN' || this.role === 'SUPER_ADMIN';
  }

  // Verificar si es super admin
  isSuperAdmin(): boolean {
    return this.role === 'SUPER_ADMIN';
  }

  // Verificar si puede acceder al panel de admin
  canAccessAdmin(): boolean {
    return this.isAdmin() && this.isActive && this.emailVerified;
  }

  // Verificar si el email está verificado
  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  // Convertir a respuesta pública (sin datos sensibles)
  toResponse(): UserResponse {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      isActive: this.isActive,
      role: this.role,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Actualizar perfil
  updateProfile(data: UpdateProfileDto): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      data.firstName ?? this.firstName,
      data.lastName ?? this.lastName,
      data.phone ?? this.phone,
      this.isActive,
      this.role,
      this.emailVerified,
      this.createdAt,
      new Date()
    );
  }

  // Verificar email
  verifyEmail(): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.firstName,
      this.lastName,
      this.phone,
      this.isActive,
      this.role,
      true,
      this.createdAt,
      new Date()
    );
  }

  // Desactivar usuario
  deactivate(): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.firstName,
      this.lastName,
      this.phone,
      false,
      this.role,
      this.emailVerified,
      this.createdAt,
      new Date()
    );
  }

  // Activar usuario
  activate(): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.firstName,
      this.lastName,
      this.phone,
      true,
      this.role,
      this.emailVerified,
      this.createdAt,
      new Date()
    );
  }
}
