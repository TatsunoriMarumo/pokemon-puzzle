import { AppError, ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { t } from "../lang";

const ERROR_MESSAGE_BY_CODE: Record<ErrorCode, string> = {
  [ERROR_CODES.API_REQUEST_FAILED]: t.error.apiRequestFailed,
  [ERROR_CODES.API_BASE_URL_MISSING]: t.error.apiBaseUrlMissing,
  [ERROR_CODES.AUDIO_CONTEXT_NOT_SUPPORTED]: t.error.audioContextNotSupported,
  [ERROR_CODES.AUDIO_FETCH_FAILED]: t.error.audioFetchFailed,
  [ERROR_CODES.AUDIO_DECODE_FAILED]: t.error.audioDecodeFailed,
  [ERROR_CODES.UNEXPECTED_ERROR]: t.error.unexpectedError,
};

export function resolveErrorMessage(error: unknown): string {
  const errorCode = extractErrorCode(error);

  if (!errorCode) {
    return t.error.unexpectedError;
  }

  return ERROR_MESSAGE_BY_CODE[errorCode];
}

function extractErrorCode(error: unknown): ErrorCode | null {
  if (error instanceof AppError) {
    return error.code;
  }

  if (error instanceof Error && isErrorCode(error.message)) {
    return error.message;
  }

  return null;
}

function isErrorCode(value: string): value is ErrorCode {
  return Object.values(ERROR_CODES).includes(value as ErrorCode);
}
