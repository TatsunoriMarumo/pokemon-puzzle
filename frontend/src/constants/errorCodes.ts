export const ERROR_CODES = {
  API_REQUEST_FAILED: "API_REQUEST_FAILED",
  API_BASE_URL_MISSING: "API_BASE_URL_MISSING",
  AUDIO_CONTEXT_NOT_SUPPORTED: "AUDIO_CONTEXT_NOT_SUPPORTED",
  AUDIO_FETCH_FAILED: "AUDIO_FETCH_FAILED",
  AUDIO_DECODE_FAILED: "AUDIO_DECODE_FAILED",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode) {
    super(code);
    this.name = "AppError";
    this.code = code;
  }
}
