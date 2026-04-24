import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ApiValidationError } from '../data/services/api/models/api-error';

export interface ErrorCategory {
  type: string;
  severity: 'info' | 'warning' | 'error';
  title: string;
  userFriendlyMessage: string;
  originalMessage: string;
  duration: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function readValidationErrors(body: unknown): ApiValidationError[] | undefined {
  if (!isRecord(body)) return undefined;
  const raw = body['Errors'] ?? body['errors'];
  if (!Array.isArray(raw)) return undefined;
  const out: ApiValidationError[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const prop = item['Property'] ?? item['property'];
    const errs = item['Errors'] ?? item['errors'];
    if (typeof prop !== 'string' || !Array.isArray(errs)) continue;
    const strings = errs.filter((e): e is string => typeof e === 'string');
    if (strings.length) out.push({ Property: prop, Errors: strings });
  }
  return out.length ? out : undefined;
}

export class ErrorExtractor {
  static readonly ErrorTypes = {
    USER_ACTIVATION: 'user-activation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    VALIDATION: 'validation',
    SYSTEM: 'system',
    NETWORK: 'network',
    UNKNOWN: 'unknown',
  } as const;

  /**
   * Parses ProblemDetails + validation payload from an HTTP error body.
   */
  static parseApiErrorBody(body: unknown): ApiError | null {
    if (body === null || body === undefined) return null;
    if (typeof body === 'string') {
      return { detail: body };
    }
    if (!isRecord(body)) return null;

    const validationErrors = readValidationErrors(body);
    const api: ApiError = {
      type: typeof body['type'] === 'string' ? body['type'] : undefined,
      title: typeof body['title'] === 'string' ? body['title'] : undefined,
      status: typeof body['status'] === 'number' ? body['status'] : undefined,
      detail: typeof body['detail'] === 'string' ? body['detail'] : undefined,
      instance: typeof body['instance'] === 'string' ? body['instance'] : undefined,
    };
    if (validationErrors) api.Errors = validationErrors;
    if (
      api.type === undefined &&
      api.title === undefined &&
      api.detail === undefined &&
      !api.Errors
    ) {
      return null;
    }
    return api;
  }

  /**
   * Extracts a meaningful error message from HttpErrorResponse.
   * Handles ProblemDetails and validation:
   * { type, title, status, detail, Errors: [{ Property, Errors: string[] }] }
   */
  static extractErrorMessage(error: HttpErrorResponse): string {
    const body = error?.error;

    if (!body) {
      return error?.message ?? 'An unknown error occurred.';
    }

    if (typeof body === 'string') {
      const match = body.match(/BusinessException: (.*?)(\r\n|$)/);
      return match?.[1] ?? body;
    }

    const validation = readValidationErrors(body);
    if (validation && validation.length > 0) {
      const messages = validation.flatMap((e) => e.Errors.map((msg) => `${e.Property}: ${msg}`));
      return messages.join('\n');
    }

    const parsed = this.parseApiErrorBody(body);
    if (parsed?.detail) return parsed.detail;
    if (parsed?.title) return parsed.title;

    if (isRecord(body) && typeof body['message'] === 'string') {
      return body['message'];
    }

    return 'An unknown error occurred.';
  }

  /**
   * Extracts a meaningful error message from any error object (non-HTTP errors too).
   */
  static extractGeneralErrorMessage(error: unknown): string {
    if (!error) {
      return 'An unknown error occurred.';
    }

    const body = (error as { error?: unknown }).error ?? error;

    if (typeof body === 'string') {
      const match = body.match(/BusinessException: (.*?)(\r\n|$)/);
      return match?.[1] ?? body;
    }

    const validation = readValidationErrors(body);
    if (validation && validation.length > 0) {
      const messages = validation.flatMap((e) => e.Errors.map((msg) => `${e.Property}: ${msg}`));
      return messages.join('\n');
    }

    const parsed = this.parseApiErrorBody(body);
    if (parsed?.detail) return parsed.detail;
    if (parsed?.title) return parsed.title;
    if (error instanceof Error && error.message) return error.message;

    return 'An unknown error occurred.';
  }

  /**
   * Returns a structured ErrorCategory for display (toast, alert, etc.).
   */
  static categorizeError(errorMessage: string, isSystemError: boolean = false): ErrorCategory {
    const originalMessage = errorMessage;

    if (this.isUserActivationRequired(errorMessage)) {
      return {
        type: this.ErrorTypes.USER_ACTIVATION,
        severity: 'info',
        title: 'Information',
        userFriendlyMessage: errorMessage,
        originalMessage,
        duration: 6000,
      };
    }

    if (this.isAuthenticationError(errorMessage)) {
      return {
        type: this.ErrorTypes.AUTHENTICATION,
        severity: 'error',
        title: 'Authentication Error',
        userFriendlyMessage: errorMessage,
        originalMessage,
        duration: 3000,
      };
    }

    if (this.isAuthorizationError(errorMessage)) {
      return {
        type: this.ErrorTypes.AUTHORIZATION,
        severity: 'warning',
        title: 'Authorization Error',
        userFriendlyMessage: errorMessage,
        originalMessage,
        duration: 4000,
      };
    }

    if (this.isValidationError(errorMessage)) {
      return {
        type: this.ErrorTypes.VALIDATION,
        severity: 'warning',
        title: 'Validation Error',
        userFriendlyMessage: errorMessage,
        originalMessage,
        duration: 3500,
      };
    }

    if (this.isNetworkError(errorMessage)) {
      return {
        type: this.ErrorTypes.NETWORK,
        severity: 'error',
        title: 'Connection Error',
        userFriendlyMessage: errorMessage,
        originalMessage,
        duration: 4000,
      };
    }

    return {
      type: isSystemError ? this.ErrorTypes.SYSTEM : this.ErrorTypes.UNKNOWN,
      severity: 'error',
      title: isSystemError ? 'System Error' : 'Error',
      userFriendlyMessage: errorMessage,
      originalMessage,
      duration: isSystemError ? 3500 : 3000,
    };
  }

  static isUserActivationRequired(message: string): boolean {
    const keywords = [
      'activation required',
      'needs to be activated',
      'account not active',
      'user not active',
      'pending admin approval',
      'account not approved',
    ];
    const lower = message.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }

  static isAuthenticationError(message: string): boolean {
    const keywords = [
      'username',
      'password',
      'invalid',
      'incorrect',
      'wrong',
      'authentication',
      'login failed',
      'unauthorized',
    ];
    const lower = message.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }

  static isAuthorizationError(message: string): boolean {
    const keywords = [
      'unauthorized',
      'forbidden',
      'access denied',
      'permission',
      'role',
      'privilege',
    ];
    const lower = message.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }

  static isValidationError(message: string): boolean {
    const keywords = [
      'validation',
      'required',
      'invalid',
      'missing',
      'empty',
      'format',
      'must be',
      'must have',
    ];
    const lower = message.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }

  static isNetworkError(message: string): boolean {
    const keywords = [
      'network',
      'connection',
      'timeout',
      'unreachable',
      'internet',
      'server',
      'http error',
    ];
    const lower = message.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }
}
