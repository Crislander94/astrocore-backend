import { UserRepository } from '@/domain/repositories/UserRepository.js';
import { VerificationCodeRepository } from '@/domain/repositories/VerificationCodeRepository.js';
import { JwtService } from '@/application/ports/JwtService.js';
import { VerifyCodeDto, AuthResponse } from '@/domain/entities/User.js';
import { VerificationCodeType } from '@/domain/entities/VerificationCode.js';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError.js';
import { logger } from '@/shared/utils/logger.js';

export class VerifyCodeUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationCodeRepository: VerificationCodeRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(verifyData: VerifyCodeDto, type: VerificationCodeType): Promise<AuthResponse> {
    try {
      // Buscar código de verificación válido
      const verificationCode = await this.verificationCodeRepository.findValidCode(
        verifyData.email,
        verifyData.code,
        type
      );

      if (!verificationCode) {
        throw new ValidationError('Código de verificación inválido o expirado');
      }

      // Verificar que el código no haya sido usado
      if (!verificationCode.isValid()) {
        throw new ValidationError('El código de verificación ha expirado o ya fue usado');
      }

      // Buscar usuario
      const user = await this.userRepository.findByEmail(verifyData.email);
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      // Marcar código como usado
      await this.verificationCodeRepository.markAsUsed(verificationCode.id);

      // Si es registro, verificar email del usuario
      let updatedUser = user;
      if (type === 'REGISTER' && !user.emailVerified) {
        updatedUser = await this.userRepository.verifyEmail(user.id);
      }

      // Generar tokens JWT
      const { accessToken, refreshToken, expiresIn } = await this.jwtService.generateTokens({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      });

      logger.info(`User ${verifyData.email} verified successfully with ${type} code`);

      return {
        user: updatedUser.toResponse(),
        accessToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      logger.error('Error in VerifyCodeUseCase:', error);
      throw error;
    }
  }
}
