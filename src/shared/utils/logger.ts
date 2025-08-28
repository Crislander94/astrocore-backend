import { config } from '@/infrastructure/config/environment.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private logLevel: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      this.safeStringify(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
  }

  private safeStringify(obj: any): string {
    if (obj === null || obj === undefined) {
      return String(obj);
    }

    if (typeof obj !== 'object') {
      return String(obj);
    }

    // Manejar errores de manera especial
    if (obj instanceof Error) {
      return `Error: ${obj.message}\nStack: ${obj.stack}`;
    }

    // Crear un replacer para manejar referencias circulares
    const seen = new WeakSet();
    
    try {
      return JSON.stringify(obj, (key, value) => {
        // Filtrar propiedades problemáticas comunes
        if (key === 'issuerCertificate' || 
            key === 'certificate' || 
            key === 'socket' || 
            key === 'connection' ||
            key === '_events' ||
            key === '_eventsCount' ||
            key === 'domain') {
          return '[Filtered]';
        }

        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        
        return value;
      }, 2);
    } catch (error) {
      // Si aún falla, devolver una representación básica
      return `[Object: ${obj.constructor?.name || 'Unknown'}]`;
    }
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, ...args);
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger(config.logging.level as LogLevel);
