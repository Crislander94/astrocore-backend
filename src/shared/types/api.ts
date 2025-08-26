import { z } from 'zod';

// Respuesta estándar de la API
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Respuesta paginada
export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    items: z.array(z.any()),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
});

// Parámetros de paginación
export const paginationParamsSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
});

// Parámetros de ordenamiento
export const sortParamsSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Filtros de búsqueda
export const searchParamsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
});

// Error de validación
export const validationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});

// Respuesta de error
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.string(),
  errors: z.array(validationErrorSchema).optional(),
});

// Types
export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T = any> = {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
};

export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type SortParams = z.infer<typeof sortParamsSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Helper functions
export function createSuccessResponse<T>(data: T, message: string = 'Success'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function createErrorResponse(message: string, error: string = 'ERROR'): ErrorResponse {
  return {
    success: false,
    message,
    error,
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success'
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    message,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  };
}

// Utility para calcular offset de paginación
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
