/**
 * Error handling utility for consistent error management across the app
 */

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export function formatError(error: unknown): ErrorResponse {
  if (!error) {
    return { message: "An unknown error occurred" };
  }

  // Handle Supabase errors
  if (error instanceof Error) {
    const errMessage = error.message || "An error occurred";
    
    // Check for specific Supabase error patterns
    if (errMessage.includes("invalid")) {
      return {
        message: "Invalid input provided. Please check your data.",
        code: "INVALID_INPUT",
        details: error,
      };
    }
    
    if (errMessage.includes("duplicate")) {
      return {
        message: "This record already exists.",
        code: "DUPLICATE_ENTRY",
        details: error,
      };
    }
    
    if (errMessage.includes("unauthorized") || errMessage.includes("permission")) {
      return {
        message: "You don't have permission to perform this action.",
        code: "UNAUTHORIZED",
        details: error,
      };
    }
    
    if (errMessage.includes("not found")) {
      return {
        message: "The requested resource was not found.",
        code: "NOT_FOUND",
        details: error,
      };
    }
    
    return {
      message: errMessage,
      code: "ERROR",
      details: error,
    };
  }

  // Handle plain objects (common for fetch errors)
  if (typeof error === "object" && "message" in error) {
    return {
      message: (error as any).message || "An error occurred",
      code: (error as any).code,
      details: error,
    };
  }

  // Fallback
  return {
    message: String(error) || "An unexpected error occurred",
    details: error,
  };
}

export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  fallbackMessage: string = "Operation failed"
): Promise<{ data: T | null; error: ErrorResponse | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const formattedError = formatError(error);
    return {
      data: null,
      error: {
        message: formattedError.message || fallbackMessage,
        code: formattedError.code,
        details: formattedError.details,
      },
    };
  }
}
