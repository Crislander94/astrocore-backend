export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtService {
  // Generar par de tokens (access + refresh)
  generateTokens(payload: JwtPayload): Promise<TokenPair>;

  // Verificar token de acceso
  verifyAccessToken(token: string): Promise<JwtPayload>;

  // Verificar token de refresh
  verifyRefreshToken(token: string): Promise<JwtPayload>;

  // Renovar tokens usando refresh token
  refreshTokens(refreshToken: string): Promise<TokenPair>;

  // Extraer token del header Authorization
  extractTokenFromHeader(authHeader: string | undefined): string | null;

  // Verificar si el token ha expirado
  isTokenExpired(token: string): boolean;
}
