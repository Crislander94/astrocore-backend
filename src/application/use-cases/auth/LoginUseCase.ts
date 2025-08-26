import { UserRepository } from '@/domain/repositories/UserRepository.js';
import { VerificationCodeRepository } from '@/domain/repositories/VerificationCodeRepository.js';
import { EmailService } from '@/application/ports/EmailService.js';
import { VerificationCodeEntity } from '@/domain/entities/VerificationCode.js';
import { RequestLogin } from '@/domain/entities/User.js';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError.js';
import { logger } from '@/shared/utils/logger.js';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationCodeRepository: VerificationCodeRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(loginData: RequestLogin): Promise<{ message: string; email: string }> {
    try {
      // Validar que el usuario existe
      const user = await this.userRepository.findByEmail(loginData.email);
      if (!user) {
        throw new NotFoundError('Usuario no encontrado. Por favor regístrate primero.');
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        throw new ValidationError('Tu cuenta ha sido desactivada. Contacta al soporte.');
      }

      // Eliminar códigos anteriores del mismo tipo
      await this.verificationCodeRepository.deleteByEmailAndType(loginData.email, 'LOGIN');

      // Generar nuevo código de verificación
      const verificationCode = VerificationCodeEntity.create(
        '', // Se generará en el repositorio
        loginData.email,
        'LOGIN',
        10 // 10 minutos de expiración
      );

      // Guardar código en la base de datos
      const savedCode = await this.verificationCodeRepository.create(verificationCode);

      // Enviar código por email
      await this.emailService.sendVerificationCode(
        loginData.email,
        user.getFullName(),
        savedCode.code,
        'LOGIN'
      );

      logger.info(`Login code sent to ${loginData.email}`);

      return {
        message: 'Código de verificación enviado a tu email',
        email: loginData.email,
      };
    } catch (error) {
      logger.error('Error in LoginUseCase:', error);
      throw error;
    }
  }
}
