import { toast } from '@/hooks/use-toast'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class DataError extends AppError {
  constructor(message: string) {
    super(message, 'DATA_ERROR', 422)
    this.name = 'DataError'
  }
}

export function handleError(error: unknown, context?: string): void {
  console.error(`Error in ${context || 'unknown context'}:`, error)
  
  if (error instanceof ValidationError) {
    toast({
      title: 'Validation Error',
      description: error.message,
      variant: 'destructive',
    })
  } else if (error instanceof DataError) {
    toast({
      title: 'Data Error',
      description: error.message,
      variant: 'destructive',
    })
  } else if (error instanceof AppError) {
    toast({
      title: 'Application Error',
      description: error.message,
      variant: 'destructive',
    })
  } else {
    toast({
      title: 'Unexpected Error',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      variant: 'destructive',
    })
  }
}

export function safeAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | null> {
  return fn().catch(error => {
    handleError(error, context)
    return null
  })
}

export function safeSync<T>(
  fn: () => T,
  context?: string
): T | null {
  try {
    return fn()
  } catch (error) {
    handleError(error, context)
    return null
  }
}
