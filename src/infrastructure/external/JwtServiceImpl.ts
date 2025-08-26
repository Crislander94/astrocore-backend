import jwt from 'jsonwebtoken';
import { JwtService, JwtPayload, TokenPair } from '@/application/ports/JwtService.js';
import { config } from '@/infrastructure/config/environment.js';
import { UnauthorizedError } from '@/shared/errors/AppError.js';

export class JwtServiceImpl implements JwtService {
  async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    // Calcular tiempo de expiración en segundos
    const expiresIn = this.getTokenExpirationTime(config.jwt.expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      throw new UnauthorizedError('Invalid token');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);
    
    // Generar nuevos tokens
    return this.generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  private getTokenExpirationTime(expiresIn: string): number {
    // Convertir string como "7d", "24h", "60m" a segundos
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60;
      case 'h':
        return value * 60 * 60;
      case 'm':
        return value * 60;
      case 's':
        return value;
      default:
        return 3600; // 1 hora por defecto
    }
  }
}
