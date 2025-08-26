import { UserRepository } from '@/domain/repositories/UserRepository.js';
import { VerificationCodeRepository } from '@/domain/repositories/VerificationCodeRepository.js';
import { EmailService } from '@/application/ports/EmailService.js';
import { UserEntity, RequestRegister } from '@/domain/entities/User.js';
import { VerificationCodeEntity } from '@/domain/entities/VerificationCode.js';
import { ConflictError } from '@/shared/errors/AppError.js';
import { logger } from '@/shared/utils/logger.js';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationCodeRepository: VerificationCodeRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(registerData: RequestRegister): Promise<{ message: string; email: string }> {
    try {
      // Verificar que el usuario no existe
      const existingUser = await this.userRepository.findByEmail(registerData.email);
      if (existingUser) {
        throw new ConflictError('Ya existe una cuenta con este email');
      }

      // Crear nuevo usuario (sin verificar email inicialmente)
      const newUser = new UserEntity(
        '', // Se generará en el repositorio
        registerData.email,
        registerData.firstName,
        registerData.lastName,
        null, // phone
        true, // isActive
        'CUSTOMER', // role
        false, // emailVerified
        new Date(),
        new Date()
      );

      // Guardar usuario en la base de datos
      const savedUser = await this.userRepository.create(newUser);

      // Eliminar códigos anteriores del mismo tipo
      await this.verificationCodeRepository.deleteByEmailAndType(registerData.email, 'REGISTER');

      // Generar código de verificación
      const verificationCode = VerificationCodeEntity.create(
        '', // Se generará en el repositorio
        registerData.email,
        'REGISTER',
        15 // 15 minutos de expiración para registro
      );

      // Guardar código en la base de datos
      const savedCode = await this.verificationCodeRepository.create(verificationCode);

      // Enviar código por email
      await this.emailService.sendVerificationCode(
        registerData.email,
        savedUser.getFullName(),
        savedCode.code,
        'REGISTER'
      );

      logger.info(`Registration code sent to ${registerData.email}`);

      return {
        message: 'Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.',
        email: registerData.email,
      };
    } catch (error) {
      logger.error('Error in RegisterUseCase:', error);
      throw error;
    }
  }
}
