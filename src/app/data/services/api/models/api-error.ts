/**
 * ASP.NET Core ProblemDetails + validation payload.
 * Example:
 * { "type", "title", "status", "detail", "Errors": [{ "Property", "Errors": string[] }] }
 */
export interface ApiValidationError {
  Property: string;
  Errors: string[];
}

export interface ApiError {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** Pascal-case per typical ASP.NET serialization */
  Errors?: ApiValidationError[];
}
